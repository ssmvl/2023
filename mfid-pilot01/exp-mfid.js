// jsPsych initialization
var jsPsych = initJsPsych({
  experiment_width: 800,
  on_finish: function(){
    if (window.hasOwnProperty('RUN_ID') && window.hasOwnProperty('LAST_MSG')) {  // cognition.run workaround
      var c = document.getElementById('jspsych-content');
      c.innerHTML = window.LAST_MSG;
    } else {
      jsPsych.data.displayData();
      // prolofic integration
      //window.location = 'https://app.prolific.co/submissions/complete?cc=XXXXXXX';
    }
  }
});

// jsPsych timeline
var timeline = [];

// browser check
timeline.push({
  type: jsPsychBrowserCheck,
  skip_features: ['webaudio', 'webcam', 'microphone'],
  inclusion_function: function(data) {
    return ['chrome', 'edge-chromium', 'firefox'].includes(data.browser) && (data.mobile === false);
  },
  exclusion_message: function(data) {
    var last_msg = data.mobile ?
      '<p>You must use a desktop/laptop computer to participate in this experiment.</p>' :
      ('edge' == data.browser ?
        '<p>You must use a newer version of Edge (released in or after 2020) to participate in this experiment.</p>' :
        '<p>You must use Chrome, Edge, or Firefox to participate in this experiment.</p>');
    if (window.hasOwnProperty('RUN_ID')) {  // cognition.run workaround
      window.LAST_MSG = last_msg;
    }
    return last_msg;
  }
});

// image preloading
timeline.push({
  type: jsPsychPreload,
  images: MFIDimgs,
  message: '<p>Loading experiment&hellip;</p>'
});

// enter fullscreen mode
timeline.push({
  type: jsPsychFullscreen,
  fullscreen_mode: true
});

// main trials
timeline.push({
  type: jsPsychHtmlKeyboardResponse,
  css_classes: ['jspsych-mfid'],
  on_finish: function(data) {
    if (data.hasOwnProperty('correct_response') && data.hasOwnProperty('response')) {
      data.correct = jsPsych.pluginAPI.compareKeys(data.response, data.correct_response);
    }
  },
  data: { exp_task: 'MFID' },
  timeline: MFIDtseq
});

// almost-there page
timeline.push({
  type: jsPsychHtmlButtonResponse,
  stimulus: `
    <h3>You are almost there</h3>
    <p>You will be directed to the Prolific website and complete your participation. Please click the button below.</p>`,
  choices: ['Continue']
});

// leave fullscreen mode
timeline.push({
  type: jsPsychFullscreen,
  fullscreen_mode: false
});

// run experiment
jsPsych.run(timeline);
