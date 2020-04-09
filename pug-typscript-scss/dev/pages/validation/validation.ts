
declare var $:any;
$( document ).ready(function() {
    $('.validation__form__submit__button').click(function(){
        var formResult = checkValidation({
            targetForm: "my_form",
            targetRadio: "radio_group",
            targetAgreement: "privacy_policy_agreement",
            targetAgreement2: "terms_and_conditions_agreement"
        });
        if (formResult) {
            
        }
        else {
            return false;
        }
    });
});