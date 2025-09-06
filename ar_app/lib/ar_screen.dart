import 'package:flutter/material.dart';
import 'package:ar_flutter_plugin/ar_flutter_plugin.dart';
import 'package:ar_flutter_plugin/datatypes/config_planedetection.dart';
import 'package:ar_flutter_plugin/datatypes/hittest_result_types.dart';
import 'package:ar_flutter_plugin/datatypes/node_types.dart';
import 'package:ar_flutter_plugin/managers/ar_anchor_manager.dart';
import 'package:ar_flutter_plugin/managers/ar_object_manager.dart';
import 'package:ar_flutter_plugin/managers/ar_session_manager.dart';
import 'package:ar_flutter_plugin/models/ar_anchor.dart';
import 'package:ar_flutter_plugin/models/ar_hittest_result.dart';
import 'package:ar_flutter_plugin/models/ar_node.dart';
import 'package:vector_math/vector_math_64.dart';
import 'dart:async';
import 'dart:math';

class ARScreen extends StatefulWidget {
  const ARScreen({Key? key}) : super(key: key);

  @override
  _ARScreenState createState() => _ARScreenState();
}

class _ARScreenState extends State<ARScreen> {
  late ARSessionManager arSessionManager;
  late ARObjectManager arObjectManager;
  late ARAnchorManager arAnchorManager;
  
  List<ARNode> nodes = [];
  List<ARAnchor> anchors = [];
  bool isARSupported = true;
  String errorMessage = '';
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    _checkARSupport();
  }

  Future<void> _checkARSupport() async {
    try {
      // Métodos actualizados para verificar compatibilidad
      bool arCoreAvailable = await ar_flutter_plugin.ArCoreAvailability.checkArCoreAvailability();
      bool arKitAvailable = await ar_flutter_plugin.ArKitAvailability.checkArKitAvailability();
      
      setState(() {
        isARSupported = arCoreAvailable || arKitAvailable;
        isLoading = false;
        
        if (!isARSupported) {
          errorMessage = 'Tu dispositivo no es compatible con Realidad Aumentada';
        }
      });
      
    } catch (e) {
      setState(() {
        isARSupported = false;
        isLoading = false;
        errorMessage = 'Error al verificar compatibilidad: $e';
      });
    }
  }

  @override
  void dispose() {
    arSessionManager.dispose();
    super.dispose();
  }

  void onARViewCreated(
    ARSessionManager sessionManager,
    ARObjectManager objectManager,
    ARAnchorManager anchorManager,
  ) {
    arSessionManager = sessionManager;
    arObjectManager = objectManager;
    arAnchorManager = anchorManager;

    arSessionManager.onInitialize(
      showFeaturePoints: false,
      showPlanes: true,
      showWorldOrigin: true,
      handleTaps: true,
    );

    arSessionManager.onPlaneOrPointTap = onPlaneOrPointTapped;
  }

  Future<void> onPlaneOrPointTapped(List<ARHitTestResult> hitTestResults) async {
    if (hitTestResults.isEmpty) return;

    final hit = hitTestResults.first;

    // Crear un anchor en la posición seleccionada
    var newAnchor = ARPlaneAnchor(transformation: hit.worldTransform);
    bool? anchorAdded = await arAnchorManager.addAnchor(newAnchor);
    
    if (anchorAdded != true) return;
    anchors.add(newAnchor);

    // Añadir un objeto 3D en el anchor - FORMA CORRECTA
    var newNode = ARNode(
      type: NodeType.cube,
      uri: null,
      scale: Vector3(0.1, 0.1, 0.1),
      position: Vector3(0, 0.1, 0),
    );

    // Método corregido - sin parámetro 'anchor'
    bool? nodeAdded = await arObjectManager.addNodeToAnchor(newNode, newAnchor);
    
    if (nodeAdded == true) {
      nodes.add(newNode);
    } else {
      await arAnchorManager.removeAnchor(newAnchor);
      anchors.remove(newAnchor);
    }
  }

  Future<void> onRemoveEverything() async {
    for (var node in nodes) {
      await arObjectManager.removeNode(node);
    }
    for (var anchor in anchors) {
      await arAnchorManager.removeAnchor(anchor);
    }
    nodes.clear();
    anchors.clear();
  }

  Future<void> addSampleObject() async {
    // Añadir objeto en posición predeterminada
    var newNode = ARNode(
      type: NodeType.cube,
      uri: null,
      scale: Vector3(0.2, 0.2, 0.2),
      position: Vector3(0, 0, -1.0), // 1 metro frente a la cámara
    );

    bool? nodeAdded = await arObjectManager.addNode(newNode);
    
    if (nodeAdded == true) {
      nodes.add(newNode);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return Scaffold(
        appBar: AppBar(title: const Text('Realidad Aumentada')),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    if (!isARSupported) {
      return Scaffold(
        appBar: AppBar(title: const Text('Realidad Aumentada')),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(20.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.error_outline, size: 64, color: Colors.red),
                const SizedBox(height: 20),
                Text(
                  errorMessage,
                  textAlign: TextAlign.center,
                  style: const TextStyle(fontSize: 18),
                ),
                const SizedBox(height: 20),
                ElevatedButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text('Volver'),
                ),
              ],
            ),
          ),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Realidad Aumentada'),
        actions: [
          IconButton(
            icon: const Icon(Icons.delete),
            onPressed: onRemoveEverything,
            tooltip: 'Eliminar todos los objetos',
          ),
        ],
      ),
      body: ARView(
        onARViewCreated: onARViewCreated,
        planeDetectionConfig: PlaneDetectionConfig.horizontalAndVertical,
      ),
      floatingActionButton: Column(
        mainAxisAlignment: MainAxisAlignment.end,
        children: [
          FloatingActionButton(
            onPressed: addSampleObject,
            child: const Icon(Icons.add),
            tooltip: 'Añadir objeto',
          ),
          const SizedBox(height: 10),
          FloatingActionButton(
            onPressed: onRemoveEverything,
            child: const Icon(Icons.delete),
            tooltip: 'Eliminar todo',
          ),
        ],
      ),
    );
  }
}