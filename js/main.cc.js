$(document).ready(function(){
    $('.lf_q_start').on('click', function(){
       lf_q.start(); 
    });
    $('.lf_q_next').on('click', function(){
       lf_q.next(); 
    });
    $('.lf_q_back').on('click', function(){
        lf_q.back();
    });
    $('.img-answer').on('click', function(){
        var parent = $(this).parents('.lf_q_item'),
            answerLabel = parent.find('label'),
            input = [];
        for(let i = 0; i < answerLabel.length; i++){
            input[i] = $(answerLabel[i]).children('input');
        }
        for(let i = 0; i < input.length; i++){
            if($(input[i]).prop('checked')){
                $(answerLabel[i]).find('p').addClass('empty-button-check');
            } else{
                $(answerLabel[i]).find('p').removeClass('empty-button-check');
            }
        }
    });
    $('.empty-button').on('click', function(){
       if($(this).children('input').prop('checked')){
           $(this).addClass('empty-button-check');
       } else{
           $(this).removeClass('empty-button-check');
       }
    });
    $('#lf_q_main_form_button').on('click', sendRequest);
    
    $('input[type=range]')
        .on('change', function(){
       $('.lf_q_range_val').text($(this).val()); 
    })
        .on('input', function(){
        $('.lf_q_range_val').text($(this).val()); 
    });
});