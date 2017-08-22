/*!
 * Wrap Layers (v1.0.1.20170813), http://tpkn.me/
 */

var lib, timeline, doc;


function getPanel(){
   var swf_panels = fl.swfPanels;

   if(swf_panels.length > 0){
      for(var i = 0; i < swf_panels.length; i++){
         if(swf_panels[i].name == 'Wrap Layers'){
            return swf_panels[i];
         }
      }
   }else{
      return 'no_panel';
   }
}


function wrapLayers(){
   if(doc != null){

      var layers = timeline.getSelectedLayers();
      
      if(layers.length > 0){
         
         var uniq = 'mc_' + (Math.round(Math.random() * 0x1000000).toString(16));
         
         /**
          * Insert layer for wrapper mc and move it on top
          */
         timeline.addNewLayer(uniq, 'normal', true);
         timeline.reorderLayer(timeline.currentLayer, 0);

         /**
          * Turn on layers outline style
          */
         timeline.layers[0].outline = true;
         
         /**
          * Select first frame of first layer and add our wrapper mc there
          */
         timeline.currentLayer = 0;
         timeline.currentFrame = 0;
         lib.addNewItem('movie clip', uniq);
         lib.addItemToDocument({x:0, y:0}, uniq);
         
         var wrapper_mc = timeline.layers[0].frames[0].elements[0].libraryItem;
         var wrapper_timeline = wrapper_mc.timeline;
         
         /**
          * Set InstanceName
          */
         doc.selection[0].name = uniq;
         
         /**
          * Change pivot point
          */
         //doc.selection[0].setTransformationPoint({x:doc.width, y:0}); // right, top
         //doc.selection[0].setTransformationPoint({x:0, y:0}); // left, top
         
         var lid, source_layer;
         
         for(var i = 0; i < layers.length; i++){
            lid = layers[i] + 1;
            
            /**
             * I don't like irrevertible changings, so it's better to copy layers instead of cutting them
             */
            timeline.copyLayers(lid);
            source_layer = timeline.layers[lid];
            source_layer.locked = true;
            source_layer.visible = false;
            source_layer.layerType = 'guide';

            /**
             * Insert copyed layers into wrapper's timeline
             */
            wrapper_timeline.pasteLayers();
         }
         
         /**
          * Insert layer for further scripts
          */
         wrapper_timeline.currentLayer = 0;
         wrapper_timeline.currentFrame = 0;
         wrapper_timeline.addNewLayer('as', 'normal', true);
         
         /**
          * Insert some script into first and last wrapper's frames
          */
         var last_frame = wrapper_timeline.frameCount - 1;
         wrapper_timeline.convertToBlankKeyframes(last_frame);
         wrapper_timeline.layers[0].frames[0].actionScript = 'if(stage.debug){\n    this.gotoAndStop(' + last_frame + ');\n}';
         wrapper_timeline.layers[0].frames[last_frame].actionScript = 'this.stop();';
         
         /**
          * Delete default layer with single empty frame
          */
         wrapper_timeline.deleteLayer(wrapper_timeline.layers.length - 1);
      }
   }
}


function documentChanged(){
   doc = fl.getDocumentDOM();

   if(doc != null){
      lib = doc.library;
      timeline = doc.getTimeline();

      layersSelected();
   }
}


function layersSelected(){
   var layers = timeline.getSelectedLayers();
   var stat = layers.length + '%split%';

   for(var i = 0; i < layers.length; i++){
      stat += timeline.layers[layers[i]].name + '%split%';
   }

   getPanel().call('layerChanged', stat);
}


function init(){
   fl.addEventListener('mouseMove', documentChanged);
   fl.addEventListener('frameChanged', layersSelected);
   fl.addEventListener('layerChanged', layersSelected);
}
