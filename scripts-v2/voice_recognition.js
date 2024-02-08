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

 let running_log = []

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

function domovoi_show_last(){
    $("#domovoi-text").show()
    $("#domovoi-img").attr("src","imgs/domovoi-heard.png")
}

function domovoi_hide_last(){
    $("#domovoi-text").hide()
    $("#domovoi-img").attr("src","imgs/domovoi.png")
}


function domovoi_heard(message){
    $("#domovoi-text").text(message.toLowerCase())
    $("#domovoi-text").show()
    $("#domovoi-img").attr("src","imgs/domovoi-heard.png")
    setTimeout(function() {
        $("#domovoi-text").hide()
        $("#domovoi-img").attr("src",markedDead ? "imgs/domovoi-died.png" : "imgs/domovoi.png")
    },2000)
}

function domovoi_not_heard(){
    $("#domovoi-img").attr("src",user_settings['domo_side'] == 1 ? "imgs/domovoi-guess-flip.png" : "imgs/domovoi-guess.png")
    setTimeout(function() {
        $("#domovoi-img").attr("src",markedDead ? "imgs/domovoi-died.png" : "imgs/domovoi.png")
    },3000)
}

function domovoi_print_logs(){
    console.log("----------------------------------------------------------------")
    console.log("Domo memory:")
    running_log.forEach(function (item,idx){
        console.log(`--${idx}--`)
        for (const [key, value] of Object.entries(item)) {
            console.log(`${key}: ${value}`)
        }
    })
    console.log("----------------------------------------------------------------")
}

function parse_speech(vtext){
    vtext = vtext.toLowerCase().trim()
    running_log.push({
        "Time":new Date().toJSON().replace('T', ' ').split('.')[0],
        "Raw":vtext
    })
    if(running_log.length > 5){
        running_log.shift()
    }
    let cur_idx = running_log.length - 1

    domovoi_msg = ""

    for (const [key, value] of Object.entries(ZNLANG['overall'])) {
        for (var i = 0; i < value.length; i++) {
            vtext = vtext.replace(value[i], key);
        }
    }

    running_log[cur_idx]["Cleaned"] = vtext

    if(vtext.startsWith('modyfikator prędkości')){
        document.getElementById("voice_recognition_status").className = null
        document.getElementById("voice_recognition_status").style.backgroundImage = "url(imgs/mic-recognized.png)"
        console.log("Recognized modyfikator prędkości command")
        running_log[cur_idx]["Type"] = "modyfikator prędkości"
        console.log(`Heard '${vtext}'`)
        vtext = vtext.replace('modyfikator prędkości', "").trim()
        domovoi_msg += "ustawiam prędkość ducha na "

        vtext = vtext.replace('trzy','3')
        vtext = vtext.replace('dwa','2')
        vtext = vtext.replace('jeden','1')
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
        domovoi_msg += smallest_num

        document.getElementById("ghost_modifier_speed").value = all_ghost_speed_convert[smallest_num] ?? 2

        if(prev_value != all_ghost_speed_convert[smallest_num]){
            setTempo();
            bpm_calc(true);
            saveSettings();
            send_state()
        }

        domovoi_heard(domovoi_msg)
        running_log[cur_idx]["Domo"] = domovoi_msg
        reset_voice_status()
    }
    else if(vtext.includes('ducha ')){
        document.getElementById("voice_recognition_status").className = null
        document.getElementById("voice_recognition_status").style.backgroundImage = "url(imgs/mic-recognized.png)"
        console.log("Recognized ducha command")
        running_log[cur_idx]["Type"] = "ducha"
        console.log(`Heard '${vtext}'`)
        vtext = vtext.replace('ducha ', "").trim()

        var smallest_ghost = "Spirit"
        var smallest_val = 100
        var vvalue = 0
        if(vtext.startsWith("wykreśl ")){
            vtext = vtext.replace("wykreśl ","").trim()
            vvalue = 0
            domovoi_msg += "wykreślam "
        }
        else if(vtext.startsWith("wyczyść")){
            vtext = vtext.replace("wyczyść ","").trim()
            vvalue = 0
            domovoi_msg = "wyczyść "
        }
        else if(vtext.startsWith("zgadnij ")){
            vtext = vtext.replace('zgadnij ', "").trim()
            vvalue = 3
            domovoi_msg = "zgaduję "
        }
        else if(vtext.startsWith("wybierz ")){
            vtext = vtext.replace('wybierz ', "").trim()
            vvalue = 2
            domovoi_msg = "wybrano "
        }
        else if(vtext.startsWith("usuń ")){
            vtext = vtext.replace('usuń ', "").trim()
            vvalue = -1
            domovoi_msg = "usuwam "
        }
        else if(vtext.startsWith("zabity przez ")){
            vtext = vtext.replace('zabity przez ', "").trim()
            vvalue = -2
            domovoi_msg = "zabity przez "
        }
        else if(vtext.startsWith("informacje o ")){
            vtext = vtext.replace('informacje o ', "").trim()
            vvalue = -10
            domovoi_msg = "informacje o "
        }

        // Common fixes to ghosts
        var prevtext = vtext;
        for (const [key, value] of Object.entries(ZNLANG['ghosts'])) {
            for (var i = 0; i < value.length; i++) {
                if(vtext.startsWith(value[i])){vtext = key}
            }
        }

        for(var i = 0; i < Object.keys(all_ghosts).length; i++){
            var leven_val = levenshtein_distance(Object.values(all_ghosts)[i].toLowerCase(),vtext)
            if(leven_val < smallest_val){
                smallest_val = leven_val 
                smallest_ghost = Object.values(all_ghosts)[i]
            }
        }
        console.log(`${prevtext} >> ${vtext} >> ${smallest_ghost}`)
        running_log[cur_idx]["Debug"] = `${prevtext} >> ${vtext} >> ${smallest_ghost}`
        domovoi_msg += smallest_ghost

        if (vvalue == 0){
            fade(document.getElementById(rev(all_ghosts,smallest_ghost)));
        }
        else if (vvalue == 3){
            guess(document.getElementById(rev(all_ghosts,smallest_ghost)));
            if(!$(document.getElementById(rev(all_ghosts,smallest_ghost))).isInViewport())
                document.getElementById(rev(all_ghosts,smallest_ghost)).scrollIntoView({alignToTop:true,behavior:"smooth"})
        }
        else if (vvalue == 2){
            select(document.getElementById(rev(all_ghosts,smallest_ghost)));
            if(!$(document.getElementById(rev(all_ghosts,smallest_ghost))).isInViewport())
                document.getElementById(rev(all_ghosts,smallest_ghost)).scrollIntoView({alignToTop:true,behavior:"smooth"})
        }
        else if (vvalue == -1){
            remove(document.getElementById(rev(all_ghosts,smallest_ghost)));
        }
        else if (vvalue == -2){
            died(document.getElementById(rev(all_ghosts,smallest_ghost)));
            if(!$(document.getElementById(rev(all_ghosts,smallest_ghost))).isInViewport())
                document.getElementById(rev(all_ghosts,smallest_ghost)).scrollIntoView({alignToTop:true,behavior:"smooth"})
        }
        else if(vvalue == -10){
            if(!$(document.getElementById(rev(all_ghosts,smallest_ghost))).isInViewport())
                document.getElementById(rev(all_ghosts,smallest_ghost)).scrollIntoView({alignToTop:true,behavior:"smooth"})
        }

        resetResetButton()
        domovoi_heard(domovoi_msg)
        running_log[cur_idx]["Domo"] = domovoi_msg
        reset_voice_status()
    }
    else if(vtext.includes('dowód ')){
        document.getElementById("voice_recognition_status").className = null
        document.getElementById("voice_recognition_status").style.backgroundImage = "url(imgs/mic-recognized.png)"
        console.log("Recognized dowód command")
        running_log[cur_idx]["Type"] = "dowód"
        console.log(`Heard '${vtext}'`)
        vtext = vtext.replace('dowód', "").trim()
        domovoi_msg += "zaznaczam dowód "

        var smallest_evidence = "emf 5"
        var smallest_val = 100
        var vvalue = 1
        if(vtext.startsWith("wykreśl ")){
            vtext = vtext.replace("wykreśl ","").trim()
            vvalue = -1
            domovoi_msg = "wykreślam dowód "
        }
        else if(vtext.startsWith("wyczyść")){
            vtext = vtext.replace("wyczyść ","").trim()
            vvalue = 0
            domovoi_msg = "czyszczę status dowodu "
        }

        // Common replacements for evidence names
        var prevtext = vtext;
        for (const [key, value] of Object.entries(ZNLANG['evidence'])) {
            for (var i = 0; i < value.length; i++) {
                if(vtext.startsWith(value[i])){vtext = key}
            }
        }


        for(var i = 0; i < Object.keys(all_evidence).length; i++){
            var leven_val = levenshtein_distance(Object.values(all_evidence)[i].toLowerCase(),vtext)
            if(leven_val < smallest_val){
                smallest_val = leven_val 
                smallest_evidence = Object.values(all_evidence)[i]
            }
        }
        console.log(`${prevtext} >> ${vtext} >> ${smallest_evidence}`)
        running_log[cur_idx]["Debug"] = `${prevtext} >> ${vtext} >> ${smallest_evidence}`
        domovoi_msg += smallest_evidence

        if(!$(document.getElementById(rev(all_evidence,smallest_evidence)).querySelector("#checkbox")).hasClass("block")){
            while (vvalue != {"good":1,"bad":-1,"neutral":0}[document.getElementById(rev(all_evidence,smallest_evidence)).querySelector("#checkbox").classList[0]]){
                tristate(document.getElementById(rev(all_evidence,smallest_evidence)));
            }
        }
        else{
            domovoi_msg = `Dowód ${smallest_evidence} zablokowany!`
        }
        

        resetResetButton()
        domovoi_heard(domovoi_msg)
        running_log[cur_idx]["Domo"] = domovoi_msg
        reset_voice_status()

    }
    else if(vtext.startsWith('małpia łapa')){
        document.getElementById("voice_recognition_status").className = null
        document.getElementById("voice_recognition_status").style.backgroundImage = "url(imgs/mic-recognized.png)"
        console.log("Recognized małpia łapa command")
        running_log[cur_idx]["Type"] = "małpia łapa"
        console.log(`Heard '${vtext}'`)
        vtext = vtext.replace('małpia łapa', "").trim()
        domovoi_msg += "marked "

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


        for(var i = 0; i < Object.keys(all_evidence).length; i++){
            var leven_val = levenshtein_distance(Object.values(all_evidence)[i].toLowerCase(),vtext)
            if(leven_val < smallest_val){
                smallest_val = leven_val 
                smallest_evidence = Object.values(all_evidence)[i]
            }
        }
        console.log(`${prevtext} >> ${vtext} >> ${smallest_evidence}`)
        running_log[cur_idx]["Debug"] = `${prevtext} >> ${vtext} >> ${smallest_evidence}`
        domovoi_msg += `zaznaczam ${smallest_evidence} jako wykreślone przez małpią łapę`

        monkeyPawFilter($(document.getElementById(rev(all_evidence,smallest_evidence))).parent().find(".monkey-paw-select"))

        resetResetButton()
        domovoi_heard(domovoi_msg)
        running_log[cur_idx]["Domo"] = domovoi_msg
        reset_voice_status()

    }
    else if (vtext.endsWith("standardowe przyśpieszenie w zasięgu wzroku")){
        document.getElementById("voice_recognition_status").className = null
        document.getElementById("voice_recognition_status").style.backgroundImage = "url(imgs/mic-recognized.png)"
        console.log("Recognized standardowe przyśpieszenie w zasięgu wzroku command")
        running_log[cur_idx]["Type"] = "standardowe przyśpieszenie w zasięgu wzroku"
        console.log(`Heard '${vtext}'`)
        vtext = vtext.replace("standardowe przyśpieszenie w zasięgu wzroku","").trim()

        console.log(`${vtext} >> Line of Sight`)
        running_log[cur_idx]["Debug"] = `${vtext} >> Line of Sight`

        if(vtext.startsWith("wykreśl ")){
            vtext = vtext.replace("wykreśl ","").trim()
            vvalue = 0
        }
        else if(vtext.startsWith("wyczyść")){
            vtext = vtext.replace("wyczyść ","").trim()
            vvalue = -1
        }

        if((vvalue==0 && all_los()) || (vvalue==1 && all_not_los())){
            domovoi_msg = `${vvalue == 0 ? 'wszystkie obecne duchy mają standardowe przyspieszenie w zasięgu wzroku' : 'Żaden z obecnych duchów nie ma standardowego przyspieszenia w zasięgu wzroku'}!`
        }
        else{
            while (!$(document.getElementById("LOS").querySelector("#checkbox")).hasClass(["neutral","bad","good"][vvalue+1])){
                tristate(document.getElementById("LOS"));
            }
            domovoi_msg = `${vvalue == -1 ? 'czyszczę' : vvalue == 0 ? 'wykreślam standardowe' : 'zaznaczam'} przyśpieszenie w zasięgu wzroku`
        }

        resetResetButton()
        domovoi_heard(domovoi_msg)
        running_log[cur_idx]["Domo"] = domovoi_msg
        reset_voice_status()
    }
    else if(vtext.includes('prędkość ')){
        document.getElementById("voice_recognition_status").className = null
        document.getElementById("voice_recognition_status").style.backgroundImage = "url(imgs/mic-recognized.png)"
        console.log("Recognized prędkość command")
        running_log[cur_idx]["Type"] = "prędkość"
        console.log(`Heard '${vtext}'`)
        vtext = vtext.replace('prędkość ', "").trim()
        domovoi_msg += "zaznaczam prędkość "

        var smallest_speed = "normalny"
        var smallest_val = 100
        var vvalue = 1
        if(vtext.startsWith("wykreśl ")){
            vtext = vtext.replace("wykreśl ","").trim()
            vvalue = 0
            domovoi_msg = "odznaczam prędkość "
        }
        else if(vtext.startsWith("wyczyść")){
            vtext = vtext.replace("wyczyść ","").trim()
            vvalue = -1
            domovoi_msg = "czyszczę prędkość "
        }

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

        for(var i = 0; i < Object.keys(all_speed).length; i++){
            var leven_val = levenshtein_distance(Object.values(all_speed)[i].toLowerCase(),vtext)
            if(leven_val < smallest_val){
                smallest_val = leven_val 
                smallest_speed = Object.values(all_speed)[i]
            }
        }
        console.log(`${prevtext} >> ${vtext} >> ${smallest_speed}`)
        running_log[cur_idx]["Debug"] = `${prevtext} >> ${vtext} >> ${smallest_speed}`
        domovoi_msg += smallest_speed

        if(!$(document.getElementById(rev(all_speed,smallest_speed)).querySelector("#checkbox")).hasClass("block")){
            while (vvalue != {"good":1,"neutral":0}[document.getElementById(rev(all_speed,smallest_speed)).querySelector("#checkbox").classList[0]]){
                dualstate(document.getElementById(rev(all_speed,smallest_speed)));
            }
        }
        else{
            domovoi_msg = `Prędkość ${smallest_speed} jest zablokowana!`
        }

        resetResetButton()
        domovoi_heard(domovoi_msg)
        running_log[cur_idx]["Domo"] = domovoi_msg
        reset_voice_status()

    }
    else if(vtext.includes('psychika ') || vtext.includes('psychikę ')){
        document.getElementById("voice_recognition_status").className = null
        document.getElementById("voice_recognition_status").style.backgroundImage = "url(imgs/mic-recognized.png)"
        console.log("Recognized psychika command")
        running_log[cur_idx]["Type"] = "psychika"
        console.log(`Heard '${vtext}'`)
        vtext = vtext.replace('psychika', "").replace('psychikę', "").trim()
        domovoi_msg = "zaznaczam psychikę przy polowaniu "

        var smallest_sanity = "Niski"
        var smallest_val = 100
        var vvalue = 1
        if(vtext.startsWith("wykreśl ")){
            vtext = vtext.replace("wykreśl ","").trim()
            vvalue = 0
            domovoi_msg = "wykreślam psychikę przy polowaniu "
        }
        else if(vtext.startsWith("wyczyść")){
            vtext = vtext.replace("wyczyść ","").trim()
            vvalue = 0
            domovoi_msg = "czyszczę psychikę przy polowaniu "
        }

        // Common replacements for sanity
        var prevtext = vtext;
        for (const [key, value] of Object.entries(ZNLANG['sanity'])) {
            for (var i = 0; i < value.length; i++) {
                if(vtext.startsWith(value[i])){vtext = key}
            }
        }

        for(var i = 0; i < Object.keys(all_sanity).length; i++){
            var leven_val = levenshtein_distance(Object.values(all_sanity)[i].toLowerCase(),vtext)
            if(leven_val < smallest_val){
                smallest_val = leven_val 
                smallest_sanity = Object.values(all_sanity)[i]
            }
        }
        console.log(`${prevtext} >> ${vtext} >> ${smallest_sanity}`)
        running_log[cur_idx]["Debug"] = `${prevtext} >> ${vtext} >> ${smallest_sanity}`
        domovoi_msg += smallest_sanity.replace("Average","Normal")

        if(!$(document.getElementById(rev(all_sanity,smallest_sanity)).querySelector("#checkbox")).hasClass("block")){
            while (vvalue != {"good":1,"neutral":0}[document.getElementById(rev(all_sanity,smallest_sanity)).querySelector("#checkbox").classList[0]]){
                dualstate(document.getElementById(rev(all_sanity,smallest_sanity)),false,true);
            }
        }
        else{
            domovoi_msg = `Psychika przy polowaniu ${smallest_sanity} jest zablokowana!`
        }

        resetResetButton()
        domovoi_heard(domovoi_msg)
        running_log[cur_idx]["Domo"] = domovoi_msg
        reset_voice_status()

    }
    else if(vtext.startsWith('odliczaj okadzenie')){
        document.getElementById("voice_recognition_status").className = null
        document.getElementById("voice_recognition_status").style.backgroundImage = "url(imgs/mic-recognized.png)"
        console.log("Recognized odliczaj okadzenie command")
        running_log[cur_idx]["Type"] = "odliczaj okadzenie"
        console.log(`Heard '${vtext}'`)

        domovoi_msg += "odliczam okadzenie"
        toggle_timer(true,false)
        send_timer(true,false)

        domovoi_heard(domovoi_msg)
        running_log[cur_idx]["Domo"] = domovoi_msg
        reset_voice_status()
    }
    else if(vtext.startsWith('zatrzymaj odliczanie okadzenia')){
        document.getElementById("voice_recognition_status").className = null
        document.getElementById("voice_recognition_status").style.backgroundImage = "url(imgs/mic-recognized.png)"
        console.log("Recognized zatrzymaj odliczanie okadzenia command")
        running_log[cur_idx]["Type"] = "zatrzymaj odliczanie okadzenia"
        console.log(`Heard '${vtext}'`)
        vtext = vtext.replace('zatrzymaj odliczanie okadzenia', "").trim()

        domovoi_msg += "zatrzymuję odliczanie okadzenia"
        toggle_timer(false,true)
        send_timer(false,true)

        domovoi_heard(domovoi_msg)
        running_log[cur_idx]["Domo"] = domovoi_msg
        reset_voice_status()
    }
    else if(vtext.startsWith('odliczaj następne polowanie')){
        document.getElementById("voice_recognition_status").className = null
        document.getElementById("voice_recognition_status").style.backgroundImage = "url(imgs/mic-recognized.png)"
        console.log("Recognized odliczaj następne polowanie command")
        running_log[cur_idx]["Type"] = "odliczaj następne polowanie"
        console.log(`Heard '${vtext}'`)

        domovoi_msg += "odliczam do następnego polowania"
        toggle_cooldown_timer(true,false)
        send_cooldown_timer(true,false)

        domovoi_heard(domovoi_msg)
        running_log[cur_idx]["Domo"] = domovoi_msg
        reset_voice_status()
    }
    else if(vtext.startsWith('zatrzymaj odliczanie następnego polowania')){
        document.getElementById("voice_recognition_status").className = null
        document.getElementById("voice_recognition_status").style.backgroundImage = "url(imgs/mic-recognized.png)"
        console.log("Recognized zatrzymaj odliczanie następnego polowania command")
        running_log[cur_idx]["Type"] = "zatrzymaj odliczanie następnego polowania"
        console.log(`Heard '${vtext}'`)
 
        domovoi_msg += "zatrzymuję odliczanie do następnego polowania"
        toggle_cooldown_timer(false,true)
        send_cooldown_timer(false,true)

        domovoi_heard(domovoi_msg)
        running_log[cur_idx]["Domo"] = domovoi_msg
        reset_voice_status()
    }
    else if(vtext.startsWith('odliczaj polowanie')){
        document.getElementById("voice_recognition_status").className = null
        document.getElementById("voice_recognition_status").style.backgroundImage = "url(imgs/mic-recognized.png)"
        console.log("Recognized odliczaj polowanie command")
        running_log[cur_idx]["Type"] = "odliczaj polowanie"
        console.log(`Heard '${vtext}'`)

        domovoi_msg += "odliczam czas do końca polowania"
        toggle_cooldown_timer(true,false)
        send_cooldown_timer(true,false)

        domovoi_heard(domovoi_msg)
        running_log[cur_idx]["Domo"] = domovoi_msg
        reset_voice_status()
    }
    else if(vtext.startsWith('zatrzymaj odliczanie polowania')){
        document.getElementById("voice_recognition_status").className = null
        document.getElementById("voice_recognition_status").style.backgroundImage = "url(imgs/mic-recognized.png)"
        console.log("Recognized zatrzymaj odliczanie polowania command")
        running_log[cur_idx]["Type"] = "zatrzymaj odliczanie polowania"
        console.log(`Heard '${vtext}'`)
 
        domovoi_msg += "zatrzymuję odliczanie do końca polowania"
        toggle_cooldown_timer(false,true)
        send_cooldown_timer(false,true)

        domovoi_heard(domovoi_msg)
        running_log[cur_idx]["Domo"] = domovoi_msg
        reset_voice_status()
    }
    else if(vtext.startsWith('czas trwania polowania')){
        document.getElementById("voice_recognition_status").className = null
        document.getElementById("voice_recognition_status").style.backgroundImage = "url(imgs/mic-recognized.png)"
        console.log("Recognized czas trwania polowania command")
        running_log[cur_idx]["Type"] = "czas trwania polowania"
        console.log(`Heard '${vtext}'`)
        vtext = vtext.replace('czas trwania polowania ', "").trim()
        domovoi_msg += "ustaw czas trwania polowania na "

        if(document.getElementById("num_evidence").value == "-1"){

            var smallest_num = "3"
            var smallest_val = 100
            var prev_value = document.getElementById("cust_hunt_length").value
            var all_hunt_length = ["krótki","niska","średnia","długi","wysoka"]

            for(var i = 0; i < all_hunt_length.length; i++){
                var leven_val = levenshtein_distance(all_hunt_length[i],vtext)
                if(leven_val < smallest_val){
                    smallest_val = leven_val 
                    smallest_num = all_hunt_length[i]
                }
            }
            domovoi_msg += smallest_num

            smallest_num = {"krótki":"3A","niska":"3A","średnia":"3I","długi":"3","wysoka":"3"}[smallest_num]
            document.getElementById("cust_hunt_length").value = smallest_num
            if(prev_value != smallest_num){
                filter()
                updateMapDifficulty(smallest_num)
                saveSettings()
            }
        }
        else{
            domovoi_msg = "Niestandardowy poziom trudności nie został wybrany"
        }

        domovoi_heard(domovoi_msg)
        running_log[cur_idx]["Domo"] = domovoi_msg
        reset_voice_status()
    }
    else if(vtext.startsWith('ilość dowodów')){
        document.getElementById("voice_recognition_status").className = null
        document.getElementById("voice_recognition_status").style.backgroundImage = "url(imgs/mic-recognized.png)"
        console.log("Recognized ilość dowodów command")
        running_log[cur_idx]["Type"] = "ilość dowodów"
        console.log(`Heard '${vtext}'`)
        vtext = vtext.replace('ilość dowodów', "").replace('poziom trudności', "").trim()
        domovoi_msg += "ustawiam ilość dowodów na "

        vtext = vtext.replace('trzy','3')
        vtext = vtext.replace('dwa','2')
        vtext = vtext.replace('jeden','1')
        vtext = vtext.replace('zero','0')

        if(document.getElementById("num_evidence").value == "-1"){
            var smallest_num = '3'
            var smallest_val = 100
            var prev_value = document.getElementById("cust_num_evidence").value
            var all_difficulty = ['0','1','2','3']

            for(var i = 0; i < all_difficulty.length; i++){
                var leven_val = levenshtein_distance(all_difficulty[i],vtext)
                if(leven_val < smallest_val){
                    smallest_val = leven_val 
                    smallest_num = all_difficulty[i]
                }
            }
            domovoi_msg += smallest_num

            document.getElementById("cust_num_evidence").value = smallest_num ?? 3
            if(prev_value != smallest_num){
                filter()
                flashMode()
                saveSettings()
            }
        }
        else{
            domovoi_msg = "Niestandardowy poziom trudności nie został wybrany"
        }

        domovoi_heard(domovoi_msg)
        running_log[cur_idx]["Domo"] = domovoi_msg
        reset_voice_status()
    }
    else if(vtext.startsWith('poziom trudności')){
        document.getElementById("voice_recognition_status").className = null
        document.getElementById("voice_recognition_status").style.backgroundImage = "url(imgs/mic-recognized.png)"
        console.log("Recognized ilość dowodów command")
        running_log[cur_idx]["Type"] = "ilość dowodów"
        console.log(`Heard '${vtext}'`)
        vtext = vtext.replace('ilość dowodów', "").replace('poziom trudności', "").trim()
        domovoi_msg += "ustaw trudność na "

        var smallest_num = '3'
        var smallest_val = 100
        var prev_value = document.getElementById("num_evidence").value
        var all_difficulty = ["niestandardowe","apokalipsa","obłęd","koszmarny","profesjonalista","średni","amator"]

        for(var i = 0; i < all_difficulty.length; i++){
            var leven_val = levenshtein_distance(all_difficulty[i],vtext)
            if(leven_val < smallest_val){
                smallest_val = leven_val 
                smallest_num = all_difficulty[i]
            }
        }
        domovoi_msg += smallest_num

        smallest_num = {"niestandardowe":"-1","apokalipsa":"0","obłęd":"1","koszmarny":"2","profesjonalista":"3","średni":"3I","amator":"3A"}[smallest_num]
        document.getElementById("num_evidence").value = smallest_num
        if(prev_value != smallest_num){
            filter()
            updateMapDifficulty(smallest_num)
            showCustom()
            flashMode()
            saveSettings()
        }

        domovoi_heard(domovoi_msg)
        running_log[cur_idx]["Domo"] = domovoi_msg
        reset_voice_status()
    }
    else if(vtext.startsWith('pokaż narzędzia') || vtext.startsWith('pokaż filtry')){
        document.getElementById("voice_recognition_status").className = null
        document.getElementById("voice_recognition_status").style.backgroundImage = "url(imgs/mic-recognized.png)"
        console.log("Recognized filtry/narzędzia command")
        running_log[cur_idx]["Type"] = "filtry/narzędzia"
        console.log(`Heard '${vtext}'`)
        domovoi_msg += "przełączam menu"

        toggleFilterTools()

        domovoi_heard(domovoi_msg)
        running_log[cur_idx]["Domo"] = domovoi_msg
        reset_voice_status()
    }
    else if(vtext.startsWith('wybierz mapę')){
        document.getElementById("voice_recognition_status").className = null
        document.getElementById("voice_recognition_status").style.backgroundImage = "url(imgs/mic-recognized.png)"
        console.log("Recognized wybierz mapę command")
        running_log[cur_idx]["Type"] = "wybierz mapę"
        console.log(`Heard '${vtext}'`)
        vtext = vtext.replace('wybierz mapę', "").trim()
        domovoi_msg = "wyświetlam mapę"

        var smallest_map = "tanglewood"
        var smallest_val = 100

        if(vtext != ""){

            // Common replacements for maps
            var prevtext = vtext;
            for (const [key, value] of Object.entries(ZNLANG['maps'])) {
                for (var i = 0; i < value.length; i++) {
                    if(vtext.includes(value[i])){vtext = vtext.replace(value[i],key)}
                }
            }

            var maps = document.getElementsByClassName("maps_button")

            for(var i = 0; i < maps.length; i++){
                var leven_val = levenshtein_distance(maps[i].id.toLowerCase(),vtext)
                if(leven_val < smallest_val){
                    smallest_val = leven_val 
                    smallest_map = maps[i].id
                }
            }
            console.log(`${prevtext} >> ${vtext} >> ${smallest_map}`)
            running_log[cur_idx]["Debug"] = `${prevtext} >> ${vtext} >> ${smallest_map}`
            domovoi_msg += `: ${smallest_map}`
        }

        changeMap(document.getElementById(smallest_map),all_maps[smallest_map])

        domovoi_heard(domovoi_msg)
        running_log[cur_idx]["Domo"] = domovoi_msg
        reset_voice_status()
    }
    else if(vtext.startsWith('pokaż mapę')){
        document.getElementById("voice_recognition_status").className = null
        document.getElementById("voice_recognition_status").style.backgroundImage = "url(imgs/mic-recognized.png)"
        console.log("Recognized pokaż mapę command")
        running_log[cur_idx]["Type"] = "pokaż mapę"
        console.log(`Heard '${vtext}'`)
        vtext = vtext.replace('pokaż mapę', "").trim()
        domovoi_msg = "wyświetlam mapę"

        var smallest_map = "tanglewood"
        var smallest_val = 100

        if(vtext != ""){

            // Common replacements for maps
            var prevtext = vtext;
            for (const [key, value] of Object.entries(ZNLANG['maps'])) {
                for (var i = 0; i < value.length; i++) {
                    if(vtext.includes(value[i])){vtext = vtext.replace(value[i],key)}
                }
            }

            var maps = document.getElementsByClassName("maps_button")

            for(var i = 0; i < maps.length; i++){
                var leven_val = levenshtein_distance(maps[i].id.toLowerCase(),vtext)
                if(leven_val < smallest_val){
                    smallest_val = leven_val 
                    smallest_map = maps[i].id
                }
            }
            console.log(`${prevtext} >> ${vtext} >> ${smallest_map}`)
            running_log[cur_idx]["Debug"] = `${prevtext} >> ${vtext} >> ${smallest_map}`
            domovoi_msg += `: ${smallest_map}`

            changeMap(document.getElementById(smallest_map),all_maps[smallest_map])
        }

        showMaps(true,false)

        domovoi_heard(domovoi_msg)
        running_log[cur_idx]["Domo"] = domovoi_msg
        reset_voice_status()
    }
    else if(vtext.startsWith('zamknij mapę') || vtext.startsWith('ukryj mapę')){
        document.getElementById("voice_recognition_status").className = null
        document.getElementById("voice_recognition_status").style.backgroundImage = "url(imgs/mic-recognized.png)"
        console.log("Recognized map command")
        running_log[cur_idx]["Type"] = "maps"
        console.log(`Heard '${vtext}'`)
        domovoi_msg = "zamykam mapę"

        showMaps(false, true)

        domovoi_heard(domovoi_msg)
        running_log[cur_idx]["Domo"] = domovoi_msg
        reset_voice_status()
    }
    else if(vtext.startsWith('zresetuj poradnik') || vtext.startsWith('zresetuj dziennik')){
        document.getElementById("voice_recognition_status").className = null
        document.getElementById("voice_recognition_status").style.backgroundImage = "url(imgs/mic-recognized.png)"
        console.log("Recognized zresetuj dziennik command")
        console.log(`Heard '${vtext}'`)
        reset()
    }
    else if(vtext.startsWith('wyłącz rozpoznawanie głosu')){
        document.getElementById("voice_recognition_status").className = null
        document.getElementById("voice_recognition_status").style.backgroundImage = "url(imgs/mic-recognized.png)"
        console.log("Recognized wyłącz rozpoznawanie głosu command")
        console.log(`Heard '${vtext}'`)
        stop_voice()
    }
    else if(
        vtext.startsWith("cześć domo") || vtext.startsWith("cześć domovoi")
    ){
        domovoi_heard("cześć!")

        reset_voice_status()
    }
    else if(
        vtext.startsWith("move domo") || vtext.startsWith("move domovoi")|| vtext.startsWith("move zero") ||
        vtext.startsWith("domo move") || vtext.startsWith("domovoi move")|| vtext.startsWith("zero move")
    ){
        if (user_settings['domo_side'] == 0){
            $("#domovoi").addClass("domovoi-flip")
            $("#domovoi-img").addClass("domovoi-img-flip")
        }
        else{
            $("#domovoi").removeClass("domovoi-flip")
            $("#domovoi-img").removeClass("domovoi-img-flip")
        }
        saveSettings()
        
        reset_voice_status()
    }
    else{
        document.getElementById("voice_recognition_status").className = null
        document.getElementById("voice_recognition_status").style.backgroundImage = "url(imgs/mic-not-recognized.png)"
        domovoi_not_heard()
        reset_voice_status()
    }


}

if (("webkitSpeechRecognition" in window || "speechRecognition" in window) && !navigator.userAgent.toLowerCase().match(/firefox|fxios|opr/) && !('brave' in navigator)) {
    let speechRecognition = new webkitSpeechRecognition() || new speechRecognition();
    let stop_listen = true
  
    speechRecognition.continuous = false;
    speechRecognition.interimResults = false;
    speechRecognition.lang = 'pl';
  
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
            $("#domovoi").show()
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
        $("#domovoi").hide()
        speechRecognition.stop();
    }

  } else {
    document.getElementById("start_voice").disabled = true
    document.getElementById("stop_voice").disabled = true
    document.getElementById("start_voice").style.display = "none"
    document.getElementById("stop_voice").style.display = "none"
    document.getElementById("voice_recognition_note").innerHTML = "Przeglądarka nie jest obsługiwana"
    console.log("Speech Recognition Not Available");
  }

