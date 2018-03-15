//<---------------------------functions and global variables--------------------------->

//<---------------------------variables--------------------------->  
$.ajaxSetup({   // НА
    async:false // ХУ
});             // Я?
var config, //test information (questions)
    currentQuestion = 1,//questions counter
    tests = [],//test objects array
    numOfQuestions,//total questions
    lf_q = { //core methods
        //string phoneNumber - will be shown in verify heading. User's phone number
        displayVerify: function(phoneNumber){ //shows sms-verify screen 
            $('.lf_q_verify_form_h > span').text(phoneNumber); //writing the number in to the span inside heading
            $('.lf_q_main_form_wrapper').css('display', 'none'); //hiding main form section
            $('.lf_q_verify_popup').css('display', 'block'); //showing verify section
        },
        hideVerify: function(){ //hides sms-verify screen
            $('.lf_q_verify_popup').css('display', 'none'); //hiding sms-verify section
            $('.lf_q_main_form_wrapper').css('display', 'block'); //showing main form section
        },
        displaySuccessScreen: function(){ //shows success screen
            $('.lf_q_verify_popup').css('display', 'none'); //hiding sms-verify section
            $('.lf_q_main_form_wrapper').css('display', 'none'); //hiding main form section
            $('.lf_q_progress_bar').css('display', 'none'); //hiding main form section
            $('.lf_q_test_heading').css('display', 'none'); //hiding main form section
            $('.lf_q_success').css('display', 'block'); //showing success screen
        },
        displayResults: function(){ //shows screen with main and verify form
            lf_q.handleProgressBar(currentQuestion+1);
            $('.lf_q_question_count').text('Тест успешно пройден, остался последний шаг');
            $('.lf_q_questions').css('display', 'none'); //hiding questions screen
            $('.lf_q_progress_bar').css('display', 'block'); //hiding questions screen
            $('.lf_q_results').css('display', 'block'); //showing results screen
        },
        displayAnalysis: function(){ //shows analysis imitation screen
            $('.lf_q_items_wrapper').css('display', 'none'); //hiding questions section
            $('.lf_q_progress_bar').css('display', 'none'); //hiding questions section
            $('.lf_q_questions_heading').css('display', 'none'); //hiding questions section
            $('.lf_q_questions_footer').css('display', 'none'); //hiding questions section
            $('.lf_q_analysis').css('display', 'block'); //showing analysis section
            $('.lf_q_progress_text').css('display', 'none'); //hiding progress-bar text
        },
        //int currentQuestionNumber
        handleProgressBar: function (currentQuestionNumber){//sets the progress-bar width and texts percents at the screen
            var progressItems = $('.lf_q_progress_wrapper').children();
            $(progressItems[currentQuestionNumber-1]).addClass('done');
        },
        //int previousQuestionNumber, int nextQuestionNumber
        displayAnswers: function(previousQuestionNumber, nextQuestionNumber){ //switches the question sections
            $('.lf_q_item_' + previousQuestionNumber).css('display', 'none'); //hides previous question section
            $('.lf_q_item_' + nextQuestionNumber).css('display', 'block'); //shows next question section
        },
        next: function(){ //
            $('.lf_q_next').removeClass('error');
            if(tests[currentQuestion-1].checkInputs()){ //checking fields filled or not
                tests[currentQuestion-1].collectData();
            } else if(!tests[currentQuestion-1].skip){  //if it could be skipped
                $('.lf_q_next').addClass('error');
                return false;
            }
            if((numOfQuestions-currentQuestion) == 0){ //checking is that last question
                //eval("yaCounter" + _yaCounterID + ".reachGoal('seen_results');");
                processAnalysis();
                fillVariative();
            } else{
                toggleAnswersScreen(currentQuestion, (++currentQuestion));
                lf_q.handleProgressBar(currentQuestion, numOfQuestions);
                printQuestionTexts(currentQuestion, numOfQuestions, tests[currentQuestion-1].question);
                if(tests[currentQuestion-1].skip) 
                    $('.lf_q_next').text('Пропустить');
                else 
                    $('.lf_q_next').text('Далее');
            }
            
        },
        back: function(){
            toggleAnswersScreen(currentQuestion, (--currentQuestion));
            lf_q.handleProgressBar(((currentQuestion/(numOfQuestions+1))*100));
            printQuestionTexts(currentQuestion, numOfQuestions, tests[currentQuestion-1].question);
        },
        start: function(){
    //        eval("yaCounter" + _yaCounterID + ".reachGoal('test-start');");
            lf_q.handleProgressBar(currentQuestion, numOfQuestions);
            printQuestionTexts(currentQuestion, numOfQuestions, tests[currentQuestion-1].question);
            if(tests[currentQuestion-1].skip) 
                $('.lf_q_next').text('Пропустить');
            else 
                $('.lf_q_next').text('Далее');
            $('.lf_q_start_page').css('display','none');
            $('.lf_q_questions').css('display', 'block');
            $('.lf_q_test_heading').css('display', 'block');
            $('.lf_q_progress_bar').css('display', 'block');
            $('.lf_q_item_' + (currentQuestion)).css('display', 'block');
            $('.lf_q_back').css('display', 'none');
        }
    };
$.get("js/config.json", function(data){
  config = data;
     //   config = JSON.parse(data);
    numOfQuestions = config.length-1;//total questions
   _yaCounterID = parseInt(config[numOfQuestions]._yaCounterID);
    for(var i = 0; i < (numOfQuestions); i++){//initialization of array
    tests[i] = new Test(config[i]);
    }
    $.ajaxSetup({async:true});
})
.done(function(){/*console.log("done");*/})
.fail(function(jqXHR, textStatus, errorThrown){
//    console.log(jqXHR);
//    console.log(textStatus);
//    console.log(errorThrown);
});


    //<---------------------------cookie variables--------------------------->
var date = new Date();
date.setDate(date.getDate() + 1); 
var discount = getCookie("discountQuiz") ? getCookie("discountQuiz") : 30000;
var totalVisitors = getCookie("totalVisitorsCount") ? getCookie("totalVisitorsCount") : getRandomInt(10, 40);
totalVisitors = parseInt(totalVisitors);
//console.log(totalVisitors);
    //<---------------------------/cookie variables--------------------------->
//<---------------------------/variables--------------------------->

//<---------------------------functions--------------------------->
function interval(o){
    var i = 0,
        count = o.count || 1,
        timeout = o.timeout || 1000,
        repeat = o.repeat || function(){},
        end = o.end || function(){};
    function tick(){
        i++;
        if(typeof o.timeout == 'function') timeout = o.timeout();
        if(i < count){
            repeat(i);
            setTimeout(tick, timeout);
        } else{
            end();
        }
    }
    setTimeout(tick, timeout);
}

function closeSmsVerify(i){
    clearInterval(i);
    lf_q.hideVerify();
}

function setSmsCountdown(){
    var counter = 0;
    var smsInterval = setInterval(function(){
        if(counter == 0){
            $('.lf_q_verify_send_again').html('Повторная отправка возможна через 0:<span>59</span>');
        } else if(counter != 59){
            $('.lf_q_verify_send_again > span').html((59 - counter));
        } else {
            clearInterval(smsInterval);
            $('.lf_q_verify_send_again').html('<span>Отправить новое СМС</span>');
            $('.lf_q_verify_send_again > span').click(sendSMS);
        }
        counter++;
    },1000);
    $('.lf_q_verify_back').click(function(){closeSmsVerify(smsInterval);});
}

function sendSMS(){
    var pwd = getRandomInt(1000, 9999);
//    console.log(pwd);
    var s = getData().phone,
        str = parseInt(s.replace(/\D+/g,"")),
        queryString = 'https://gate.smsaero.ru/send/?user='+config[config.length-1].smsAero.user+'&password='+config[config.length-1].smsAero.password+'&to='+str+'&text='+pwd+'&from=news';
    $.ajax({
        async: true,
        url: queryString,
        success: function(data){
//            console.log(data);
            if(data == '=no credits'){
                mainQuery();
            } else {
                setSmsCountdown();
                $('#lf_q_verify_form_button').click(function(){checkSmsPassword(pwd);});
                lf_q.displayVerify(s);
            }
        }
    });
}

function processAnalysis(){
    if(config[config.length-1].loader){
        lf_q.displayAnalysis();
        interval({
            count: 100,
            timeout: function(){return getRandomInt(5, 15)*10;},
            repeat: function(count){
                $('.analize-progress').width(count+'%');
                $('.lf_q_analysis > span').text(count+'%');
            },
            end: lf_q.displayResults
        });    
    } else{
        lf_q.displayResults();
    }
}

function showFileName(e){
    var fileName = '',
        label	 = document.querySelectorAll('.lf_q_file_status')[0],
        labelVal = label.innerHTML;
    if( this.files && this.files.length > 1 )
      fileName = ( this.getAttribute( 'data-multiple-caption' ) || '' ).replace( '{count}', this.files.length );
    else
      fileName = e.target.value.split( '\\' ).pop();
        if( fileName )
      label.innerHTML = fileName;
    else
      label.innerHTML = labelVal;
}

function checkSmsPassword(p){
    if($('#lf_q_verify_code').val() == p){
        mainQuery();
    } else{
        $('#lf_q_verify_code').addClass('error');
    } 
}

function sendData(d){
    if(d){
        $.ajax({
            async: true,
            url: 'lf_send.php',
            type: 'POST',
            contentType: false,
            processData: false, 
            cache: false,
            headers: { 'cache-control': 'no-cache' }, // fix for IOS6 (not tested)
            data: d,
            timeout: 7000,
            success: function(data){
                var answer = 'success';
//                console.log(data);
                data = JSON.parse(data);
                if (data == null || data.FILE.status.code != 0){
                    answer = data.FILE.status.description || "data is null";
                }
//                console.log(answer);
            },//success
            error: function(jqXHR, textStatus, errorThrown){
                console.log(textStatus);
                console.log(errorThrown);
            }//error
        });//ajax()
    } else {
//        console.log('There\'s no data to send!');
    }
}

function appendFiles(d){
    $.each($("#lf_q_input_file")[0].files, function(i, file){//добавление файлов к общим данным
        d.append('file-'+i, file);
    });
    d.append('id',config[config.length-1].projectID);
}

function mainQuery(){
    var formData = new FormData();
    tests[currentQuestion] = getData();
    formData.append('jsonData', JSON.stringify(tests, ["question","testData", "phone", "email", "number", "projectID", "fio", "discount", "variativeAnswer"], 4));
    if(config[config.length-1].file){
        appendFiles(formData);
    }
    sendData(formData);
//  eval("yaCounter" + _yaCounterID + ".reachGoal('thanks_page');");
    lf_q.displaySuccessScreen();
}

function sendRequest(){
    if($('#lf_q_agreement').prop('checked') && formFilled()){
//            eval("yaCounter" + _yaCounterID + ".reachGoal('get_phone');");
        if(config[numOfQuestions].smsActivate){
            sendSMS();
        } else{
            mainQuery();
        }
    }
}

//описание объекта вопросa
function Test(configItem){
    this.inputType = configItem.inputType;//тип инпута вопроса
    this.questionNumber = configItem.questionNumber;
    this.selector = $('.lf_q_item_' + (this.questionNumber));//селектор с номером вопроса
    this.question = configItem.question;//формулировка вопроса
    this.image = configItem.image;
    this.skip = configItem.skip;
    this.answers = configItem.answers;
    this.testData = [];//массив для сбора отмеченных ответов
}

Test.prototype.collectData = function (){ //функция сбора данных вопроса
    if(typeof(this.inputType) == "string"){
        var data = [],
            input = (this.inputType == "checkbox" || this.inputType == "radio") ? 'input:' + this.inputType + ':checked' : 'input[type='+this.inputType+']';
        if(input != "input:file"){
            var increment = 0;
            $($(this.selector).find(input)).each(function(i){
                data[i] = $(this).prop('value');
            });
        }
    }
        console.log(data);
    this.testData = data;
}

Test.prototype.checkInputs = function (){
    var inputType = 'input[type='+this.inputType+']',
        amount = $(this.selector).find(inputType).length,
        count = 0,
        items = [];
    items = $(this.selector).find(inputType);
    for(var i = 0; i < items.length; i++){
        var e = $(items[i]),
            check = e.parents('.lf_q_answer').find('input:checkbox');
        if(e.prop('checked')){
            return true;
        } else if((inputType == 'input[type=text]' || inputType == 'input[type=range]') && e.val() || check.prop('checked')) {
            count++;
        }
    }
    return count == amount;
}

function formFilled(){
    var a = true,
        inputs = $('#lf_q_main_form').find('input');
    for(var i = 0; i < inputs.length; i++){
        if(!$(inputs[i]).val()){
            $(inputs[i]).addClass('error');
            a = false;
        }
    }
    return a;
}

//a - number of question to hide, b - number of question to show
function toggleAnswersScreen(a, b){
    if(b == 1){
        $('.lf_q_back').css('display', 'none');
    } else {
        $('.lf_q_back').css('display', 'block');
    }
    lf_q.displayAnswers(a, b);
}

function printQuestionTexts(a, b, c){
    $('.lf_q_current_question').text(a);
    $('.lf_q_question_amount').text(b);
    $('.lf_q_question_text').text(c);
}


function getData (){ //сбор данных главной формы
    var obj = {
          phone: $("input[name=phone]").val(),
          email: $("input[name=email]").val(),
          projectID: config[config.length-1].projectID,
          variativeAnswer: variative()
    };
    return obj;
}
// использование Math.round() даст неравномерное распределение!
function getRandomInt(min, max){
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getCookie(name) {
    var matches = document.cookie.match(new RegExp(
    "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}
// !!!!!!!!!!!!!!!!!!!variative() function
function variative(){}

function fillVariative(){
    var variatives = [],
        firstMax = getRandomInt(8, 12),
        secondMax = firstMax - getRandomInt(2, 4),
        firstNumber = 0,
        secondNumber = 0;
    variatives = $('.lf_q_variative_text');
    var firstInterval = setInterval(function(){
        if(secondNumber < secondMax){
            $(variatives[1]).text(secondNumber);
            $('.lf_q_variative_text_2').text(secondNumber);
            secondNumber++;
            $(variatives[0]).text(firstNumber);
            firstNumber++;
        } else if(firstNumber < firstMax){
            $(variatives[0]).text(firstNumber);
            firstNumber++;
        } else {
            clearInterval(firstInterval);
        }
    }, 50);
}

visitorsTimer = setTimeout(function visitorsTick() {//рекурсивный таймер
        totalVisitors += getRandomInt(1,3); 
        document.cookie = "totalVisitorsCount=" + totalVisitors + "; path=/; expires=" + date.toUTCString(); 
        $('.lf_q_visitors_now').text((3 + getRandomInt(1,9)));
        $('.lf_q_visitors_today').text(totalVisitors);
        visitorsTimer = setTimeout(visitorsTick, 10000);
        }, 4);


//$("[name = phone]").mask("+7 (999) 999-99-99");
//
function scrollToElement(theElement) {
    var selectedPosX = 0;
    var selectedPosY = 0;
    while (theElement != null) {
        selectedPosX += theElement.offsetLeft;
        selectedPosY += theElement.offsetTop;
        theElement = theElement.offsetParent;
    }                    		      
    window.scrollTo(selectedPosX,selectedPosY);
}