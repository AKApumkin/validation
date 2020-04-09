declare var $:any;
/**
 * Interface for form validation. Checks all input types and returns specific errors on the client side.
 * multilingual support via the componenet file validation.pug that can be modified in the CMS.
 */
interface validationOptions {
    targetForm: string; // The Target form ID * Required
    targetGroup?: string; // 
    targetGroupRequired?: number; // 
    targetRadio?: string; // The target parent class of one radio selection group * Not required 
    targetAgreement?: string; // The target parent class of one checkbox agreement * Not required 
    targetAgreement2?: string; // The target parent class of one checkbox agreement * Not required 
    errorBorderColor?: string; // The css color of the border for any input field with an error * Not required 
    errorTextColor?: string;  // the css color of the error text * Not required 
    securityTokens?:string; // The target class for any CSRF or secuirty token required to sumbit the form * Not required 
}
/**
 *
 * Takes in an object group to be used as variables. the checkValidation can validated any input field with any regex. It will display an error and return
 * false until all inputs in a field have passed. For checkbox's target the parent class.
 *
 *  @param interface userInput
 */
function checkValidation(userInput:validationOptions):boolean {
    // check the ammount of required otpions in a group, if no input is given then the default is 1.
    if(!userInput.targetGroupRequired) {
        userInput.targetGroupRequired = 1;
    }

    // set colors
    let errorColor = checkDefault(userInput.errorBorderColor, 'red');
    let textColor = checkDefault(userInput.errorTextColor, 'red');

    // sets the regex for the validation, the first one includes Chinese, Korean and Japanese
    let regex:RegExp = /^[-'a-zA-Z#\s\u4e00-\u9eff]{1,}$/i;
    let regexEmail:RegExp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    let regexPhone:RegExp = /^(?:(?:\(?(?:00|\+)([1-4]\d\d|[1-9]\d?)\)?)?[\-\.\ \\\/]?)?((?:\(?\d{1,}\)?[\-\.\ \\\/]?){0,16})(?:[\-\.\ \\\/]?(?:#|ext\.?|extension|x)[\-\.\ \\\/]?(\d+))?$/i
    let regexAddr:RegExp =  /^[-'a-zA-Z0-9\s_.,!\"\'\$\&\;\?\u4e00-\u9eff]{1,}$/i;

    // gets the error text set in the validation.pug componenet
    let e_fieldEmpty = $('input[name="errorEmpty"]').val();
    let e_specialCharacters = $('input[name="errorSpecial"]').val();
    let e_checkboxGroup = $('input[name="errorGroup"]').val() +' '+userInput.targetGroupRequired;
    let e_fullNameError = $('input[name="errorFullName"]').val();
    let e_chooseEmail = $('input[name="errorEmail"]').val();
    let e_choosePhone = $('input[name="errorPhone"]').val();
    let e_agreement = $('input[name="errorAgree"]').val();
    let e_chooseRadio = $('input[name="errorRadio"]').val();
    
    // counts the errors
    let noErrors:number = 0;
    let firstError:number = -1;

    // Set object to return
    let formValues:any = [];

    // loops through the target from and gets all inputs
    $('#'+userInput.targetForm+' :input').each(function(index:number) {

        // gets the value, type and name of an input
        let inputValue:string = $(this).val();
        let inputID:string = $(this).attr('id');
        // set the regex to use
        let regexTarget:RegExp;
        let errorMessage:string;
        switch(inputID){
            case 'v-name':{
                regexTarget = regex;
                errorMessage = e_specialCharacters;
                break;
            }
            case 'v-email': {
                regexTarget = regexEmail;
                errorMessage = e_chooseEmail;
                break;
            }
            case 'v-tel':{
                regexTarget = regexPhone;
                errorMessage = e_choosePhone;
                break;
            }
            default: {
                regexTarget = regexAddr;
                errorMessage = e_specialCharacters;
                break;
            }
        }
        //allow security tokens if the exist
        if(userInput.securityTokens){
            if($(this).attr('name') === userInput.securityTokens) {
                return;
            }
        }
        
        // checks if a field is required
        if($(this).prop('required') && inputValue.length <= 0) {
            drawError(e_fieldEmpty, this, errorColor, textColor);
            noErrors +=1;
            firstError = hasError(index, firstError);
        }
        // checks that there are no speical characters on any value
        else if(inputValue.length > 0 && !regexTarget.test(inputValue)) {
            drawError(errorMessage, this, errorColor, textColor);
            noErrors +=1;
            firstError = hasError(index, firstError);
        } 
        else if(inputID === 'm-name' && inputValue.length <= 1){
            drawError(e_fullNameError, this, errorColor, textColor);
            noErrors +=1;
            firstError = hasError(index, firstError);
        }
        else {
            // removes error messages
            $(this).removeAttr('aria-label');
            $(this).siblings('p').text('').css({'display':'none'}).removeClass('show');
            $(this).addClass('hasError');
        }
        let inputObject = {inputID,inputValue};
        formValues.push(inputObject);
    });

    // check checkbox's
    if(userInput.targetGroup) {
        noErrors += checkCheckboxGroup(userInput.targetGroup, userInput.targetGroupRequired, e_checkboxGroup, errorColor);
    }
    // the checkbox for the radio button must be checkd
    if(userInput.targetRadio) {
        noErrors += checkRadioGroup(userInput.targetRadio, 1, e_chooseRadio, errorColor);
    }
    // the checkbox for the user agreement must be checkd
    if(userInput.targetAgreement) {
        noErrors += checkCheckboxGroup(userInput.targetAgreement, 1, e_agreement, textColor);
    }
    if(userInput.targetAgreement2) {
        noErrors += checkCheckboxGroup(userInput.targetAgreement2, 1, e_agreement, textColor);
    }
    // submits the form if there are no errors
    if(noErrors === 0) {
        $('#'+userInput.targetForm+' p').find('.v-error').css({'display':'none'}).removeClass('show');
        return formValues;
    } else {
        $('#'+userInput.targetForm+' :input:eq('+firstError+')').focus();
        return false;
    }
}

// checks that at least oen checkbox has been checked
function checkCheckboxGroup(targetGroup:string, targetGroupRequired:number, errorMessage:string, errorColor:string) :number {
    let errorCount:number = 0;
    let groups = $("." + targetGroup + " input[type=checkbox]:checked").length;
    if(groups < targetGroupRequired) {
        $('.'+targetGroup).find('p').text(errorMessage).css({'display':'inline-block','border':'none', 'color':errorColor}).addClass('show');
        errorCount = 1
    } else {
        $('.'+targetGroup).find('p').text('').css({'display':'none'}).removeClass('show');
    }
    return errorCount;
}

// checks that at least oen checkbox has been checked
function checkRadioGroup(targetGroup:string, targetGroupRequired:number, errorMessage:string, errorColor:string) :number {
    let errorCount:number = 0;
    let groups = $("." + targetGroup + " input[type=radio]:checked").length;
    if(groups < targetGroupRequired) {
        $('.'+targetGroup).find('p').text(errorMessage).css({'display':'inline-block','border':'none', 'color':errorColor}).addClass('show');
        errorCount = 1
    } else {
        $('.'+targetGroup).find('p').text('').css({'display':'none'}).removeClass('show');
    }
    return errorCount;
}

// checks if the the first error hasn't been set yet
function hasError(index:number, firstError:number) {
    if(firstError < 0) {
        return index;
    } else {
        return firstError;
    }
}

// draws the error on screen
function drawError(error:string, object:object, errorColor:string, textColor:string) {
    $(object).addClass('hasError');
    let labelText = $(object).parent().find('label').text();
    $(object).attr('aria-label', labelText +" "+ error);
    $(object).parent().find('p').text(error).css({'display':'inline-block', 'color':textColor}).addClass('show');
}

// check if a deafault value has been set
function checkDefault(initial:string, defaultValue:string):string {
    if(!initial) {
        return defaultValue;
    } else {
        return initial;
    }
}