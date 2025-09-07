import 'dart:async';
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:ar_flutter_plugin/ar_flutter_plugin.dart';
import 'package:ar_flutter_plugin/datatypes/config_planedetection.dart';
import 'package:ar_flutter_plugin/datatypes/node_types.dart';
import 'package:ar_flutter_plugin/managers/ar_anchor_manager.dart';
import 'package:ar_flutter_plugin/managers/ar_location_manager.dart';
import 'package:ar_flutter_plugin/managers/ar_object_manager.dart';
import 'package:ar_flutter_plugin/managers/ar_session_manager.dart';
import 'package:ar_flutter_plugin/models/ar_anchor.dart';
import 'package:ar_flutter_plugin/models/ar_node.dart';
import 'package:vector_math/vector_math_64.dart' as vector_math;

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'AR IoT Sensors',
      theme: ThemeData(primarySwatch: Colors.blue),
      home: ARViewScreen(),
    );
  }
}

class ARViewScreen extends StatefulWidget {
  @override
  _ARViewScreenState createState() => _ARViewScreenState();
}

class _ARViewScreenState extends State<ARViewScreen> {
  ARSessionManager? arSessionManager;
  ARObjectManager? arObjectManager;
  ARAnchorManager? arAnchorManager;

  ARAnchor? currentAnchor;
  List<ARNode> nodes = [];
  SensorData sensorData = SensorData();
  Timer? sensorTimer;

  @override
  void initState() {
    super.initState();
    sensorTimer = Timer.periodic(Duration(seconds: 2), (timer) {
      setState(() {
        sensorData.updateData();
      });
    });
  }

  @override
  void dispose() {
    sensorTimer?.cancel();
    if (currentAnchor != null) {
      arAnchorManager?.removeAnchor(currentAnchor!);
    }
    super.dispose();
  }

  void onARViewCreated(
    ARSessionManager arSessionManager,
    ARObjectManager arObjectManager,
    ARAnchorManager arAnchorManager,
    ARLocationManager arLocationManager,
  ) {
    this.arSessionManager = arSessionManager;
    this.arObjectManager = arObjectManager;
    this.arAnchorManager = arAnchorManager;

    this.arSessionManager!.onInitialize(
      showFeaturePoints: false,
      showPlanes: true,
      showWorldOrigin: true,
      handlePans: true,
      handleRotation: true,
    );
    this.arObjectManager!.onInitialize();
    this.arSessionManager!.onPlaneOrPointTap = onPlaneTap;
  }

  Future<void> onPlaneTap(List<dynamic> hitTestResults) async {
    if (hitTestResults.isEmpty) return;
    var singleHitTestResult = hitTestResults.first;

    var newAnchor = ARPlaneAnchor(transformation: singleHitTestResult.worldTransform);
    bool? didAddAnchor = await arAnchorManager!.addAnchor(newAnchor);

    if (didAddAnchor == true) {
      if (currentAnchor != null) {
        await arAnchorManager!.removeAnchor(currentAnchor!);
      }
      nodes.clear();
      setState(() {
        currentAnchor = newAnchor;
      });
      await addObject(newAnchor);
    }
  }

  Future<void> addObject(ARPlaneAnchor anchor) async {
    try {
      var sensorNode = ARNode(
        type: NodeType.webGLB,
        uri: "https://modelviewer.dev/shared-assets/models/Astronaut.glb",
        scale: vector_math.Vector3(0.1, 0.1, 0.1),
        position: vector_math.Vector3(0, 0.05, 0),
        rotation: vector_math.Vector4(0, 0, 0, 0),
      );

      bool? didAddNode = await arObjectManager!.addNode(sensorNode, planeAnchor: anchor);

      if (didAddNode == true) {
        setState(() {
          nodes.add(sensorNode);
        });
        await addSensorPanel(anchor);
      }
    } catch (e) {
      print("Error adding object: $e");
    }
  }

  Future<void> addSensorPanel(ARPlaneAnchor anchor) async {
    final panelNode = ARNode(
      type: NodeType.webGLB,
      uri: "https://modelviewer.dev/shared-assets/models/NeilArmstrong.glb",
      scale: vector_math.Vector3(0.05, 0.05, 0.01),
      position: vector_math.Vector3(0.0, 0.15, 0.0),
      rotation: vector_math.Vector4(0, 0, 0, 0),
    );

    final didAddPanel = await arObjectManager!.addNode(panelNode, planeAnchor: anchor);

    if (didAddPanel == true) {
      setState(() {
        nodes.add(panelNode);
      });
    }
  }

  Future<void> removeAllAnchors() async {
    if (currentAnchor != null) {
      await arAnchorManager!.removeAnchor(currentAnchor!);
      setState(() {
        currentAnchor = null;
        nodes.clear();
      });
    }
  }

  void showEditDialog() {
    final tempController = TextEditingController(text: sensorData.temperature.toStringAsFixed(1));
    final humController = TextEditingController(text: sensorData.humidity.toStringAsFixed(1));

    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: Text('Modificar datos del sensor'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: tempController,
                keyboardType: TextInputType.number,
                decoration: InputDecoration(labelText: 'Temperatura (°C)'),
              ),
              TextField(
                controller: humController,
                keyboardType: TextInputType.number,
                decoration: InputDecoration(labelText: 'Humedad (%)'),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: Text('Cancelar'),
            ),
            ElevatedButton(
              onPressed: () {
                setState(() {
                  sensorData.temperature = double.tryParse(tempController.text) ?? sensorData.temperature;
                  sensorData.humidity = double.tryParse(humController.text) ?? sensorData.humidity;
                });
                Navigator.pop(context);
              },
              child: Text('Guardar'),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Sensor IoT en AR'),
        actions: [
          IconButton(
            icon: Icon(Icons.edit),
            tooltip: 'Modificar datos',
            onPressed: showEditDialog,
          ),
          IconButton(
            icon: Icon(Icons.delete),
            onPressed: removeAllAnchors,
          ),
        ],
      ),
      body: Container(
        child: ARView(
          onARViewCreated: onARViewCreated,
          planeDetectionConfig: PlaneDetectionConfig.horizontalAndVertical,
        ),
      ),
      bottomSheet: Container(
        padding: EdgeInsets.all(16),
        color: Colors.black54,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Datos del Sensor IoT:',
                style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
            SizedBox(height: 8),
            Text('Temperatura: ${sensorData.temperature.toStringAsFixed(1)}°C',
                style: TextStyle(color: Colors.white)),
            Text('Humedad: ${sensorData.humidity.toStringAsFixed(1)}%',
                style: TextStyle(color: Colors.white)),
            Text('Presión: ${sensorData.pressure.toStringAsFixed(1)} hPa',
                style: TextStyle(color: Colors.white)),
            SizedBox(height: 8),
            Text('Toque en una superficie plana para colocar el sensor',
                style: TextStyle(color: Colors.yellow, fontSize: 12)),
            SizedBox(height: 4),
            Text(currentAnchor != null ? 'Sensor colocado ✓' : 'Esperando superficie...',
                style: TextStyle(color: currentAnchor != null ? Colors.green : Colors.orange)),
          ],
        ),
      ),
      floatingActionButton: Column(
        mainAxisAlignment: MainAxisAlignment.end,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          FloatingActionButton(
            onPressed: () {
              setState(() {
                sensorData.updateData();
              });
            },
            child: Icon(Icons.refresh),
            tooltip: 'Actualizar datos',
          ),
          SizedBox(height: 10),
          if (currentAnchor != null)
            FloatingActionButton(
              onPressed: removeAllAnchors,
              child: Icon(Icons.delete_forever),
              tooltip: 'Eliminar sensor',
              backgroundColor: Colors.red,
            ),
        ],
      ),
    );
  }
}

class SensorData {
  double temperature = 0.0;
  double humidity = 0.0;
  double pressure = 0.0;
  Random random = Random();
  void updateData() {
    temperature = 20 + random.nextDouble() * 10; // 20-30 °C
    humidity = 30 + random.nextDouble() * 50; // 30-80 %
    pressure = 1000 + random.nextDouble() * 50; // 1000-1050 hPa
  } 
  SensorData() {
    updateData();
  }     
}