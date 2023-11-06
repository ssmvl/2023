// jsPsych initialization
var jsPsych = initJsPsych({
  experiment_width: 800,
  on_finish: function(){
    jsPsych.data.displayData();
  }
});

// jsPsych timeline
var timeline = [];

// preload images
timeline.push({
  type: jsPsychPreload,
  images: MFEXimgs,
  message: '<p>Loading experiment&hellip;</p>'
});

// odd-one-out task
timeline.push({
  type: jsPsychHtmlKeyboardResponse,
  css_classes: ['jspsych-mfex'],
  on_finish: function(data) {
    if (data.hasOwnProperty('correct_response') && data.hasOwnProperty('response')) {
      data.correct = jsPsych.pluginAPI.compareKeys(data.response, data.correct_response);
    }
  },
  data: { exp_task: 'MFEX' },
  timeline: MFEXtseq
});

// run experiment
jsPsych.run(timeline);
