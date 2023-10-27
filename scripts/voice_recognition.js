const levenshtein_distance = (str1 = '', str2 = '') => {
    const track = Array(str2.length + 1).fill(null).map(() =>
    Array(str1.length + 1).fill(null));
    for (let i = 0; i <= str1.length; i += 1) {
       track[0][i] = i;
    }
    for (let j = 0; j <= str2.length; j += 1) {
       track[j][0] = j;
    }
    for (let j = 1; j <= str2.length; j += 1) {
       for (let i = 1; i <= str1.length; i += 1) {
          const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
          track[j][i] = Math.min(
             track[j][i - 1] + 1,
             track[j - 1][i] + 1,
             track[j - 1][i - 1] + indicator,
          );
       }
    }
    return track[str2.length][str1.length];
 };

 $.fn.isInViewport = function () {
    let elementTop = $(this).offset().top;
    let elementBottom = elementTop + $(this).outerHeight();
  
    let viewportTop = $(window).scrollTop();
    let viewportBottom = viewportTop + window.innerHeight;
  
    return elementBottom > viewportTop && elementTop < viewportBottom;
}

function reset_voice_status(){
    setTimeout(function(){
        document.getElementById("voice_recognition_status").style.backgroundImage = "url(imgs/mic.png)";
        document.getElementById("voice_recognition_status").className = "pulse_animation"
    },1000)
}

function parse_speech(vtext){
    vtext = vtext.toLowerCase().trim()

    // Overall common replacments
    for (const [key, value] of Object.entries(ZNLANG['overall'])) {
        for (var i = 0; i < value.length; i++) {
            vtext = vtext.replace(value[i], key);
        }
    }

    if(vtext.startsWith('ghost speed')){
        document.getElementById("voice_recognition_status").className = null
        document.getElementById("voice_recognition_status").style.backgroundImage = "url(imgs/mic-recognized.png)"
        console.log("Recognized ghost speed command")
        console.log(`Heard '${vtext}'`)
        vtext = vtext.replace('ghost speed', "").trim()

        vtext = vtext.replace('three','3')
        vtext = vtext.replace('two','2').replace('to','2')
        vtext = vtext.replace('one','1')
        vtext = vtext.replace('zero','0')

        var smallest_num = '150'
        var smallest_val = 100
        var prev_value = document.getElementById("ghost_modifier_speed").value
        var all_ghost_speed = ['50','75','100','125','150']
        var all_ghost_speed_convert = {'50':0,'75':1,'100':2,'125':3,'150':4}

        for(var i = 0; i < all_ghost_speed.length; i++){
            var leven_val = levenshtein_distance(all_ghost_speed[i],vtext)
            if(leven_val < smallest_val){
                smallest_val = leven_val 
                smallest_num = all_ghost_speed[i]
            }
        }

        document.getElementById("ghost_modifier_speed").value = all_ghost_speed_convert[smallest_num] ?? 2

        if(prev_value != all_ghost_speed_convert[smallest_num]){
            setTempo();
            bpm_calc(true);
            saveSettings();
            send_state()
        }
    }
    else if(vtext.startsWith('ghost')){
        document.getElementById("voice_recognition_status").className = null
        document.getElementById("voice_recognition_status").style.backgroundImage = "url(imgs/mic-recognized.png)"
        console.log("Recognized ghost command")
        console.log(`Heard '${vtext}'`)
        vtext = vtext.replace('ghost', "").trim()
        var smallest_ghost = "Spirit"
        var smallest_val = 100
        var vvalue = 0
        if(vtext.startsWith("not ") || vtext.startsWith("knot ")){
            vtext = vtext.replace('not ', "").replace('knot ', "").trim()
            vvalue = 0
        }
        else if(vtext.startsWith("undo ") || vtext.startsWith("undue ") || vtext.startsWith("on do ") || vtext.startsWith("on due ") || vtext.startsWith("clear")){
            vtext = vtext.replace('undo ', "").replace('undue ', "").replace("on do ","").replace("on due ","").replace("clear ","").trim()
            vvalue = 0
        }
        else if(vtext.startsWith("select ") || vtext.startsWith("deselect ")){
            vtext = vtext.replace('deselect ', "").replace('select ', "").trim()
            vvalue = 2
        }
        else if(vtext.startsWith("hide ") || vtext.startsWith("remove ")){
            vtext = vtext.replace('hide ', "").replace('remove ', "").trim()
            vvalue = -1
        }

        // Common fixes to ghosts
        var prevtext = vtext;
        for (const [key, value] of Object.entries(ZNLANG['ghosts'])) {
            for (var i = 0; i < value.length; i++) {
                if(vtext.startsWith(value[i])){vtext = key}
            }
        }

        for(var i = 0; i < all_ghosts.length; i++){
            var leven_val = levenshtein_distance(all_ghosts[i].toLowerCase(),vtext)
            if(leven_val < smallest_val){
                smallest_val = leven_val 
                smallest_ghost = all_ghosts[i]
            }
        }
        console.log(`${prevtext} >> ${vtext} >> ${smallest_ghost}`)

        if (vvalue == 0){
            fade(document.getElementById(smallest_ghost));
        }
        else if (vvalue == 2){
            select(document.getElementById(smallest_ghost));
            if(!$(document.getElementById(smallest_ghost)).isInViewport())
                document.getElementById(smallest_ghost).scrollIntoView({alignToTop:true,behavior:"smooth"})
        }
        else if (vvalue == -1){
            remove(document.getElementById(smallest_ghost));
        }
        
        reset_voice_status()

    }
    else if(vtext.startsWith('evidence')){
        document.getElementById("voice_recognition_status").className = null
        document.getElementById("voice_recognition_status").style.backgroundImage = "url(imgs/mic-recognized.png)"
        console.log("Recognized evidence command")
        console.log(`Heard '${vtext}'`)
        vtext = vtext.replace('evidence', "").trim()
        var smallest_evidence = "emf 5"
        var smallest_val = 100
        var vvalue = 1
        if(vtext.startsWith("not ") || vtext.startsWith("knot ")){
            vtext = vtext.replace('not ', "").replace('knot ', "").trim()
            vvalue = -1
        }
        else if(vtext.startsWith("undo ") || vtext.startsWith("undue ") || vtext.startsWith("on do ") || vtext.startsWith("on due ") || vtext.startsWith("clear")){
            vtext = vtext.replace('undo ', "").replace('undue ', "").replace("on do ","").replace("on due ","").replace("clear ","").trim()
            vvalue = 0
        }

        // Common replacements for evidence names
        var prevtext = vtext;
        for (const [key, value] of Object.entries(ZNLANG['evidence'])) {
            for (var i = 0; i < value.length; i++) {
                if(vtext.startsWith(value[i])){vtext = key}
            }
        }

        for(var i = 0; i < all_evidence.length; i++){
            var leven_val = levenshtein_distance(all_evidence[i].toLowerCase(),vtext)
            if(leven_val < smallest_val){
                smallest_val = leven_val 
                smallest_evidence = all_evidence[i]
            }
        }
        console.log(`${prevtext} >> ${vtext} >> ${smallest_evidence}`)

        if(!$(document.getElementById(smallest_evidence).querySelector("#checkbox")).hasClass("block")){
            while (vvalue != {"good":1,"bad":-1,"neutral":0}[document.getElementById(smallest_evidence).querySelector("#checkbox").classList[0]]){
                tristate(document.getElementById(smallest_evidence));
            }
        }

        reset_voice_status()

    }
    else if(vtext.startsWith('monkey paw')){
        document.getElementById("voice_recognition_status").className = null
        document.getElementById("voice_recognition_status").style.backgroundImage = "url(imgs/mic-recognized.png)"
        console.log("Recognized evidence command")
        console.log(`Heard '${vtext}'`)
        vtext = vtext.replace('monkey paw', "").trim()
        var smallest_evidence = "emf 5"
        var smallest_val = 100
        var vvalue = 1

        // Common replacements for evidence names
        var prevtext = vtext;
        for (const [key, value] of Object.entries(ZNLANG['evidence'])) {
            for (var i = 0; i < value.length; i++) {
                if(vtext.startsWith(value[i])){vtext = key}
            }
        }

        for(var i = 0; i < all_evidence.length; i++){
            var leven_val = levenshtein_distance(all_evidence[i].toLowerCase(),vtext)
            if(leven_val < smallest_val){
                smallest_val = leven_val 
                smallest_evidence = all_evidence[i]
            }
        }
        console.log(`${prevtext} >> ${vtext} >> ${smallest_evidence}`)

        monkeyPawFilter($(document.getElementById(smallest_evidence)).parent().find(".monkey-paw-select"))

        reset_voice_status()

    }
    else if(vtext.startsWith('speed') || vtext.startsWith('feed')){
        document.getElementById("voice_recognition_status").className = null
        document.getElementById("voice_recognition_status").style.backgroundImage = "url(imgs/mic-recognized.png)"
        console.log("Recognized speed command")
        console.log(`Heard '${vtext}'`)
        vtext = vtext.replace('speed', "").replace('feed', "").trim()

        var smallest_speed = "normal"
        var smallest_val = 100
        var vvalue = 1
        if(vtext.startsWith("not ") || vtext.startsWith("knot ")){
            vtext = vtext.replace('knot ', "").replace('not ', "").trim()
            vvalue = 0
        }
        else if(vtext.startsWith("undo ") || vtext.startsWith("undue ") || vtext.startsWith("on do ") || vtext.startsWith("on due ") || vtext.startsWith("clear")){
            vtext = vtext.replace('undo ', "").replace('undue ', "").replace("on do ","").replace("on due ","").replace("clear ","").trim()
            vvalue = -1
        }

        vtext = vtext.replace("has ","")
        if (vtext.startsWith("line of sight")){
            console.log(`${vtext} >> Line of Sight`)

            if((vvalue==0 && all_los()) || (vvalue==1 && all_not_los())){
                domovoi_msg = `${vvalue == 0 ? 'All' : 'No'} current ghosts have LOS!`
            }
            else{
                while (!$(document.getElementById("LOS").querySelector("#checkbox")).hasClass(["neutral","bad","good"][vvalue+1])){
                    tristate(document.getElementById("LOS"));
                }
                domovoi_msg = `${vvalue == -1 ? 'cleared' : vvalue == 0 ? 'marked not' : 'marked'} line of sight`
            }
        }
        else{

            if (vvalue == -1){
                vvalue = 0
            }

            // Common replacements for speed
            var prevtext = vtext;
            for (const [key, value] of Object.entries(ZNLANG['speed'])) {
                for (var i = 0; i < value.length; i++) {
                    if(vtext.startsWith(value[i])){vtext = key}
                }
            }

            for(var i = 0; i < all_speed.length; i++){
                var leven_val = levenshtein_distance(all_speed[i].toLowerCase(),vtext)
                if(leven_val < smallest_val){
                    smallest_val = leven_val 
                    smallest_speed = all_speed[i]
                }
            }
            console.log(`${prevtext} >> ${vtext} >> ${smallest_speed}`)

            if(!$(document.getElementById(smallest_speed).querySelector("#checkbox")).hasClass("block")){
                while (vvalue != {"good":1,"neutral":0}[document.getElementById(smallest_speed).querySelector("#checkbox").classList[0]]){
                    dualstate(document.getElementById(smallest_speed));
                }
            }
        }

        reset_voice_status()

    }
    else if(vtext.startsWith('hunt sanity') || vtext.startsWith('sanity')){
        document.getElementById("voice_recognition_status").className = null
        document.getElementById("voice_recognition_status").style.backgroundImage = "url(imgs/mic-recognized.png)"
        console.log("Recognized speed command")
        console.log(`Heard '${vtext}'`)
        vtext = vtext.replace('hunt sanity', "").replace('sanity', "").trim()

        var smallest_sanity = "Late"
        var smallest_val = 100
        var vvalue = 1
        if(vtext.startsWith("not ") || vtext.startsWith("knot ")){
            vtext = vtext.replace('not ', "").replace('knot ', "").trim()
            vvalue = 0
        }
        else if(vtext.startsWith("undo ") || vtext.startsWith("undue ") || vtext.startsWith("on do ") || vtext.startsWith("on due ") || vtext.startsWith("clear")){
            vtext = vtext.replace('undo ', "").replace('undue ', "").replace("on do ","").replace("on due ","").replace("clear ","").trim()
            vvalue = 0
        }

         // Common replacements for sanity
        var prevtext = vtext;
        for (const [key, value] of Object.entries(ZNLANG['sanity'])) {
            for (var i = 0; i < value.length; i++) {
                if(vtext.startsWith(value[i])){vtext = key}
            }
        }

        for(var i = 0; i < all_sanity.length; i++){
            var leven_val = levenshtein_distance(all_sanity[i].toLowerCase(),vtext)
            if(leven_val < smallest_val){
                smallest_val = leven_val 
                smallest_sanity = all_sanity[i]
            }
        }
        console.log(`${prevtext} >> ${vtext} >> ${smallest_sanity}`)

        if(!$(document.getElementById(smallest_sanity).querySelector("#checkbox")).hasClass("block")){
            while (vvalue != {"good":1,"neutral":0}[document.getElementById(smallest_sanity).querySelector("#checkbox").classList[0]]){
                dualstate(document.getElementById(smallest_sanity),false,true);
            }
        }

        reset_voice_status()

    }
    else if(vtext.startsWith('timer')){
        document.getElementById("voice_recognition_status").className = null
        document.getElementById("voice_recognition_status").style.backgroundImage = "url(imgs/mic-recognized.png)"
        console.log("Recognized timer command")
        console.log(`Heard '${vtext}'`)
        vtext = vtext.replace('timer', "").trim()
        toggle_timer()
        send_timer()

        reset_voice_status()
    }
    else if(vtext.startsWith('cooldown') || vtext.startsWith('cool down')){
        document.getElementById("voice_recognition_status").className = null
        document.getElementById("voice_recognition_status").style.backgroundImage = "url(imgs/mic-recognized.png)"
        console.log("Recognized timer command")
        console.log(`Heard '${vtext}'`)
        vtext = vtext.replace('cooldown', "").replace('cool down', "").trim()
        toggle_cooldown_timer()
        send_cooldown_timer()

        reset_voice_status()
    }
    else if(vtext.startsWith('number of evidence') || vtext.startsWith('difficulty')){
        document.getElementById("voice_recognition_status").className = null
        document.getElementById("voice_recognition_status").style.backgroundImage = "url(imgs/mic-recognized.png)"
        console.log("Recognized evidence set command")
        console.log(`Heard '${vtext}'`)
        vtext = vtext.replace('number of evidence', "").replace('difficulty', "").trim()
        vtext = vtext.replace('three','3')
        vtext = vtext.replace('two','2').replace('to','2')
        vtext = vtext.replace('one','1')
        vtext = vtext.replace('zero','0')

        var smallest_num = 3
        var smallest_val = 100
        var prev_value = document.getElementById("num_evidence").value
        var all_difficulty = ['0','1','2','3']

        for(var i = 0; i < all_difficulty.length; i++){
            var leven_val = levenshtein_distance(all_difficulty[i],vtext)
            if(leven_val < smallest_val){
                smallest_val = leven_val 
                smallest_num = all_difficulty[i]
            }
        }

        document.getElementById("num_evidence").value = smallest_num ?? 3
        if(prev_value != smallest_num){
            filter()
            flashMode()
            saveSettings()
        }

        reset_voice_status()
    }
    else if(vtext.startsWith('show tools') || vtext.startsWith('show filters')){
        document.getElementById("voice_recognition_status").className = null
        document.getElementById("voice_recognition_status").style.backgroundImage = "url(imgs/mic-recognized.png)"
        console.log("Recognized filter/tool command")
        console.log(`Heard '${vtext}'`)
        toggleFilterTools()
    }
    else if(vtext.startsWith('reset cheat sheet') || vtext.startsWith('reset journal')){
        document.getElementById("voice_recognition_status").className = null
        document.getElementById("voice_recognition_status").style.backgroundImage = "url(imgs/mic-recognized.png)"
        console.log("Recognized reset command")
        console.log(`Heard '${vtext}'`)
        reset()
    }
    else if(vtext.startsWith('stop listening')){
        document.getElementById("voice_recognition_status").className = null
        document.getElementById("voice_recognition_status").style.backgroundImage = "url(imgs/mic-recognized.png)"
        console.log("Recognized stop listening command")
        console.log(`Heard '${vtext}'`)
        stop_voice()
    }
    else{
        document.getElementById("voice_recognition_status").className = null
        document.getElementById("voice_recognition_status").style.backgroundImage = "url(imgs/mic-not-recognized.png)"
        reset_voice_status()
    }


}

if (("webkitSpeechRecognition" in window || "speechRecognition" in window) && !navigator.userAgent.toLowerCase().match(/firefox|fxios|opr/) && !('brave' in navigator)) {
    let speechRecognition = new webkitSpeechRecognition() || new speechRecognition();
    let stop_listen = true
  
    speechRecognition.continuous = false;
    speechRecognition.interimResults = false;
    speechRecognition.lang = 'en-US';
  
    speechRecognition.onend = () => {
        if(!stop_listen){
            speechRecognition.start(auto=true);
        }
    }

    speechRecognition.onspeechstart = () =>{
        document.getElementById("voice_recognition_status").className = null
        document.getElementById("voice_recognition_status").style.backgroundImage = "url(imgs/mic-listening.png)"
    }

    speechRecognition.onerror = (error) =>{
        if(error.error != "no-speech")
            console.log(error)
    }
  
    speechRecognition.onresult = (event) => {
        let final_transcript = "";
  
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                final_transcript = event.results[i][0].transcript;
            }
        }

        final_transcript = final_transcript.replace(/[.,;:-]/g, '')
        parse_speech(final_transcript);
    };
    
    function start_voice(auto=false){
        stop_listen = false
        if(!auto){
            document.getElementById("start_voice").disabled = true
            document.getElementById("stop_voice").disabled = false
            document.getElementById("voice_recognition_status").style.backgroundImage = "url(imgs/mic.png)";
            document.getElementById("voice_recognition_status").className = "pulse_animation"
            document.getElementById("voice_recognition_status").style.display = "block"
            setCookie("voice_recognition_on",true,0.0833)
        }
        speechRecognition.start();
    }

    function stop_voice(){
        stop_listen = true
        document.getElementById("start_voice").disabled = false
        document.getElementById("stop_voice").disabled = true
        document.getElementById("voice_recognition_status").style.display = "none"
        setCookie("voice_recognition_on",false,-1)
        speechRecognition.stop();
    }

  } else {
    document.getElementById("start_voice").disabled = true
    document.getElementById("stop_voice").disabled = true
    document.getElementById("start_voice").style.display = "none"
    document.getElementById("stop_voice").style.display = "none"
    document.getElementById("voice_recognition_note").innerHTML = "Browser not supported"
    console.log("Speech Recognition Not Available");
  }

