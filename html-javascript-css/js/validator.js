/**
 *
 * Takes in an object group to be used as variables. the checkValidation can validated any input field with any regex. It will display an error and return
 * false until all inputs in a field have passed. For checkbox's target the parent class.
 *
 *  @param validationOptions userInput
 */
function checkValidation(userInput) {
    // check the ammount of required otpions in a group, if no input is given then the default is 1.
    if (!userInput.targetGroupRequired) {
        userInput.targetGroupRequired = 1;
    }
    // set colors
    var errorColor = checkDefault(userInput.errorBorderColor, 'red');
    var textColor = checkDefault(userInput.errorTextColor, 'red');
    // sets the regex for the validation, the first one includes Chinese, Korean and Japanese
    var regex = /^[-'a-zA-Z#\s\u4e00-\u9eff]{1,}$/i;
    var regexEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    var regexPhone = /^(?:(?:\(?(?:00|\+)([1-4]\d\d|[1-9]\d?)\)?)?[\-\.\ \\\/]?)?((?:\(?\d{1,}\)?[\-\.\ \\\/]?){0,16})(?:[\-\.\ \\\/]?(?:#|ext\.?|extension|x)[\-\.\ \\\/]?(\d+))?$/i;
    var regexAddr = /^[-'a-zA-Z0-9\s_.,!\"\'\$\&\;\?\u4e00-\u9eff]{1,}$/i;
    // gets the error text set in the validation.pug componenet
    var e_fieldEmpty = $('input[name="errorEmpty"]').val();
    var e_specialCharacters = $('input[name="errorSpecial"]').val();
    var e_checkboxGroup = $('input[name="errorGroup"]').val() + ' ' + userInput.targetGroupRequired;
    var e_fullNameError = $('input[name="errorFullName"]').val();
    var e_chooseEmail = $('input[name="errorEmail"]').val();
    var e_choosePhone = $('input[name="errorPhone"]').val();
    var e_agreement = $('input[name="errorAgree"]').val();
    // counts the errors
    var noErrors = 0;
    var firstError = -1;
    // Set object to return
    var formValues = [];
    // loops through the target from and gets all inputs
    $('#' + userInput.targetForm + ' :input').each(function (index) {
        // gets the value, type and name of an input
        var inputValue = $(this).val();
        var inputID = $(this).attr('id');
        // set the regex to use
        var regexTarget;
        var errorMessage;
        switch (inputID) {
            case 'm-name': {
                regexTarget = regex;
                errorMessage = e_specialCharacters;
                break;
            }
            case 'm-email': {
                regexTarget = regexEmail;
                errorMessage = e_chooseEmail;
                break;
            }
            case 'm-tel': {
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
        if (userInput.securityTokens) {
            if ($(this).attr('name') === userInput.securityTokens) {
                return;
            }
        }
        if (userInput.otherSecurityTokens) {
            if ($(this).attr('name') === userInput.otherSecurityTokens) {
                return;
            }
        }
        // checks if a field is required
        if ($(this).prop('required') && inputValue.length <= 0) {
            drawError(e_fieldEmpty, this, errorColor, textColor);
            noErrors += 1;
            firstError = hasError(index, firstError);
        }
        // checks that there are no speical characters on any value
        else if (inputValue.length > 0 && !regexTarget.test(inputValue)) {
            drawError(errorMessage, this, errorColor, textColor);
            noErrors += 1;
            firstError = hasError(index, firstError);
        }
        else if (inputID === 'm-name' && inputValue.length <= 1) {
            drawError(e_fullNameError, this, errorColor, textColor);
            noErrors += 1;
            firstError = hasError(index, firstError);
        }
        else {
            // removes error messages
            $(this).removeAttr('aria-label');
            $(this).siblings('p').text('').css({ 'display': 'none' }).removeClass('show');
            $(this).addClass('hasError');
        }
        var inputObject = { inputID: inputID, inputValue: inputValue };
        formValues.push(inputObject);
    });
    // check checkbox's
    if (userInput.targetGroup) {
        noErrors += checkCheckboxGroup(userInput.targetGroup, userInput.targetGroupRequired, e_checkboxGroup, errorColor);
    }
    // the checkbox for the user agreement must be checkd
    if (userInput.targetAgreement) {
        noErrors += checkCheckboxGroup(userInput.targetAgreement, 1, e_agreement, textColor);
    }
    if (userInput.targetAgreement2) {
        noErrors += checkCheckboxGroup(userInput.targetAgreement2, 1, e_agreement, textColor);
    }
    // submits the form if there are no errors
    if (noErrors === 0) {
        $('#' + userInput.targetForm + ' p').css({ 'display': 'none' }).removeClass('show');
        return formValues;
    }
    else {
        $('#' + userInput.targetForm + ' :input:eq(' + firstError + ')').focus();
        return false;
    }
}
// checks that at least oen checkbox has been checked
function checkCheckboxGroup(targetGroup, targetGroupRequired, errorMessage, errorColor) {
    var errorCount = 0;
    var groups = $("." + targetGroup + " input[type=checkbox]:checked").length;
    if (groups < targetGroupRequired) {
        $('.' + targetGroup).find('p').text(errorMessage).css({ 'display': 'inline-block', 'border': 'none', 'color': errorColor }).addClass('show');
        errorCount = 1;
    }
    else {
        $('.' + targetGroup).find('p').text('').css({ 'display': 'none' }).removeClass('show');
    }
    return errorCount;
}
// checks if the the first error hasn't been set yet
function hasError(index, firstError) {
    if (firstError < 0) {
        return index;
    }
    else {
        return firstError;
    }
}
// draws the error on screen
function drawError(error, object, errorColor, textColor) {
    $(object).addClass('hasError');
    var labelText = $(object).parent().find('label').text();
    $(object).attr('aria-label', labelText + " " + error);
    $(object).parent().find('p').text(error).css({ 'display': 'inline-block', 'color': textColor }).addClass('show');
}
// check if a deafault value has been set
function checkDefault(initial, defaultValue) {
    if (!initial) {
        return defaultValue;
    }
    else {
        return initial;
    }
}
