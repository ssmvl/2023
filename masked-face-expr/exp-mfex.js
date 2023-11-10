// utility functions
Number.prototype.pad = function(n) {
  var s = this.toString();
  return '0'.repeat(n - s.length) + s;
};
Date.prototype.toSimpleString = function() {
  return this.getFullYear() + '-' + (this.getMonth() + 1).pad(2) + '-' + this.getDate() + ' ' +
    (this.getHours() + 1).pad(2) + ':' + (this.getMinutes() + 1).pad(2) + ':' + (this.getSeconds() + 1).pad(2);
};


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

// prolific integration
/*var subject_id = jsPsych.data.getURLVariable('PROLIFIC_PID');
var study_id = jsPsych.data.getURLVariable('STUDY_ID');
var session_id = jsPsych.data.getURLVariable('SESSION_ID');
jsPsych.data.addProperties({
  subject_id: subject_id,
  study_id: study_id,
  session_id: session_id
});*/

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

// consent form
timeline.push({
  type: jsPsychExternalHtml,
  url: 'https://ssmvl.github.io/2023/masked-face-expr/consent-ext.html',
  cont_btn: 'accept',
  check_fn: _ => true,
  on_finish: function(data) {
    jsPsych.data.addProperties({
      consented_at: (new Date()).toSimpleString()
    });
  }
});

// demographic info
timeline.push({
  type: jsPsychSurvey,
  title: 'Demographic Information',
  pages: [
    [
      {
        type: 'html',
        prompt: 'Please provide your demographic information:',
        name: 'tagline'
      },
      {
        type: 'text',
        prompt: 'How old are you?',
        name: 'age',
        textbox_columns: 8,
        placeholder: 'e.g., 25',
        required: true
      }, 
      {
        type: 'drop-down',
        prompt: 'With which gender identity do you most identify?',
        name: 'gender',
        options: ['Male', 'Female', 'Transgender male', 'Transgender female', 'Other not listed', 'Prefer not to answer'],
        required: true
      },
      {
        type: 'drop-down',
        prompt: 'With which race do you most identify?',
        name: 'race',
        options: ['White', 'Black or African American', 'Asian', 'American Indian or Alaska Native', 'Native Hawaiian or Other Pacific Islander', 'Other not listed', 'Prefer not to answer'],
        required: true
      }
    ]
  ],
  button_label_finish: 'Continue to Experiment'
});

// preload images
timeline.push({
  type: jsPsychPreload,
  images: MFEXimgs,
  message: '<p>Loading experiment&hellip;</p>'
});

// enter fullscreen mode
timeline.push({
  type: jsPsychFullscreen,
  fullscreen_mode: true
});

// general instruction
timeline.push({
  type: jsPsychHtmlKeyboardResponse,
  css_classes: ['jspsych-mfex'],
  timeline: [
    { stimulus:
        `<p>In this experiment, you will use J, K, L keys and the Space bar.<br>
        Please place your fingers on J, K, L keys and press the <span class="resp-key">J</span> key.</p>`,
      choices: ['j'] },
    { stimulus: `<p>Then press the <span class="resp-key">K</span> key.</p>`,
      choices: ['k'] },
    { stimulus: `<p>Finally press the <span class="resp-key">L</span> key.</p>`,
      choices: ['l'] },
    { stimulus:
        `<p>Let&rsquo;s start the experiment, instructions and<br>
        practice trials will be given in the beginning.<br>
        Press the <span class="resp-key">Space bar</span> to continue.</p>`,
      choices: [' '] }
  ]
});

// main trials
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

// almost-there page
timeline.push({
  type: jsPsychHtmlButtonResponse,
  stimulus: `
    <h3>You are almost there</h3>
    <p>You will be directed to the Prolific website and complete your participation. Please click the button below.</p>`,
  choices: ['Continue'],
  on_finish: function(data) {
    var d = new Date();
    jsPsych.data.addProperties({
      completed_at: (new Date()).toSimpleString()
    });
  }
});

// leave fullscreen mode
timeline.push({
  type: jsPsychFullscreen,
  fullscreen_mode: false
});

// run experiment
jsPsych.run(timeline);
