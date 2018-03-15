//--- sending data

 $('.feedback-form').on('click', '.checkbox-control-block', function ()
    {
        var button = $(this).parents('.feedback-form').find('[data-target="checkbox"]');

        if ($(this).children('input').prop("checked"))
        {
            button.removeClass('disabled');
        }
        else
        {
            button.addClass('disabled');
        }
    }).on('submit', function (event)
    {
        event.preventDefault();
        var _this = $(this);
        var submitButton = _this.find('button[type="submit"]');

        if (submitButton.hasClass('disabled'))
        {
            return;
        }

        var formType = '&action=' + submitButton.data('type');
        var serverResponse = _this.find('.server-response');
        var currentPageId = '&currentPageId=' + window.pageId;
        var error = false;
        _this.find('.required').each(function ()
        {
            var element = $(this);
            var input = element.children('input');
            if (input.val() == '')
            {
                element.addClass('validation-error');
                error = true;
            }
        });

        if (error)
        {
            return;
        }

        targetPerson = _this.find('.person-slider .item.current.current .person-name').html();
        formTitle = _this.find('.form-title').html();
        targetPerson = targetPerson ? '&targetPerson=' + targetPerson : '';
        formTitle = formTitle ? '&formTitle=' + formTitle : '';
        reachYmGoal(submitButton.data('type'));

        $.ajax
        ({
            method: "POST",
            data: _this.serialize() + formType + targetPerson + formTitle + currentPageId,
            url: "/",
            success: function (data)
            {
                serverResponse.html('<span>' + data + '</span>').addClass('done');
                _this.trigger('reset');
            },
            error: function ()
            {
                serverResponse.html('<span>' + 'Ошибка отправки' + '</span>').addClass('done');
            }
        });
        return false;
    });

//--- end of sending data


//--- view core

(function($)
{
    $.fn.quiz = function()
    {
        this.questionNumberSelector = '.question-number';
        this.progressBarSelector = '.progress-bar';
        this.questionBlockSelector = '.question-block';
        this.hiddenClass = 'hidden';
        this.nextButtonSelector = '.control-button.next';
        this.prevButtonSelector = '.control-button.prev';
        this.tooltipMessageSelector = '.tooltip-message';
        this.finalBlockSelector = '.final-block';
        this.finalButtonText = '<div class="tooltip-message" style="display: none">Пожалуйста, выберите вариант ответа</div>Завершить тест';
        this.totalFlatsSelector = '#totalFlatsToSuggest';
        this.flatsToSuggestSelector = '#flatsToSuggest';
        this.priceIncreasingDateSelector = '#priceIncreasingDate';
        var _this = this;

        this.init = function()
        {
            this.numberContainer = this.find(this.questionBlockSelector);
            this.progressBar = this.find(this.progressBarSelector);
            this.items = this.find(this.questionBlockSelector);
            this.nextButton = this.find(this.nextButtonSelector);
            this.prevButton = this.find(this.prevButtonSelector);
            this.count = this.items.length;
            this.currentQuestionNumber = 0;
            this.questionNumberItem = this.find(this.questionNumberSelector);

            this.items.each(function()
            {
                if ($(this).hasClass(_this.hiddenClass))
                {
                    $(this).hide();
                    $(this).removeClass(_this.hiddenClass);
                }
            });

            this.nextButton.on('click', this.showNext);
            this.prevButton.on('click', this.showPrev);
             this.items.on('click', this.showNext);
          //  this.items.on('click', function()
            //{
             //   _this.nextButton.children(_this.tooltipMessageSelector).fadeOut();
                
          //  });
            _this.progressBar.attr('aria-valuemax', _this.count);

            this.setQuizInformation();
        };

        this.showNext = function(event)
        {




    //   if ($(this).attr('id') == 'next-flat') {
      //  var scroll_el = $('#question-number-flat');
        //    $('html, body').animate({ scrollTop: $(scroll_el).offset().top - '90' }, 500);
    //   }
       
   //     if ($(this).attr('id') == 'next-credit') {
         //      var scroll_el = $('#question-number-credit');
       //     $('html, body').animate({ scrollTop: $(scroll_el).offset().top - '90' }, 500);
    //   }
     


            
            event.preventDefault();

            var currentItem = _this.items.get(_this.currentQuestionNumber);
            currentItem = $(currentItem);
            var currentType = currentItem.data('type');

            var questionChosen = false;
            switch (currentType)
            {
                case 'radio':
                case 'check':
                    if (currentItem.find('input:checked').length)
                    {
                        questionChosen = true;
                    }
                    break;
                default:
                    questionChosen = true;
                    break;
            }

         //   if (!questionChosen)
           // {
             //   $(this).children(_this.tooltipMessageSelector).fadeIn();
               // return;
    //        }

            if ($(this).hasClass('final'))
            {
                _this.showFinalForm();
                return;
            }

            
            console.log('_this.count ' + _this.count + ' currentQuestionNumber ' + _this.currentQuestionNumber);
            if (_this.currentQuestionNumber == _this.count - 1)
            {
                _this.nextButtonContent = _this.nextButton.html();
                _this.nextButton.html(_this.finalButtonText);
                _this.nextButton.addClass('final');
                _this.showFinalForm();
            }
            if (_this.currentQuestionNumber == 1)
            {
                _this.prevButton.show();
            }
            
            $(_this.items.get(_this.currentQuestionNumber)).hide();
            _this.currentQuestionNumber++;
            $(_this.items.get(_this.currentQuestionNumber)).fadeIn();
            
            _this.setQuizInformation();
        };

        this.showPrev = function(event)
        {
            event.preventDefault();
            $(_this.items.get(_this.currentQuestionNumber)).hide();
            _this.currentQuestionNumber--;
            $(_this.items.get(_this.currentQuestionNumber)).fadeIn();
            if (_this.currentQuestionNumber == 0)
            {
                _this.prevButton.hide();
            }
            if (_this.currentQuestionNumber == _this.count - 2)
            {
                _this.nextButton.html(_this.nextButtonContent);
                _this.nextButton.removeClass('final');
                _this.nextButton.show();
            }
            _this.setQuizInformation();
        };

        this.setQuizInformation = function()
        {
            _this.questionNumberItem.html('Вопрос ' + (_this.currentQuestionNumber + 1) + ' из ' + _this.count);
            _this.progressBar.attr('style', 'width:' + _this.currentQuestionNumber / _this.count * 100 + '%;');
            _this.progressBar.attr('aria-valuenow', _this.currentQuestionNumber + 1);
        };

        this.showFinalForm = function()
        {
            _this.children().hide();
            _this.find(_this.totalFlatsSelector).html(_this.getRandomInt(9, 18));
            _this.find(_this.flatsToSuggestSelector).html(_this.getRandomInt(2, 4));
            _this.find(_this.priceIncreasingDateSelector).html();
             _this.find(_this.finalBlockSelector).fadeIn();
            
          //  $(_this.finalBlockSelector).fadeIn();
        };

        _this.getRandomInt = function(min, max)
        {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        };

        this.init();
        //this.showFinalForm();
    };
})(jQuery);

//--- end of view core