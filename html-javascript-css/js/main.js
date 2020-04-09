function submitContactForm() {
    var formResult = checkValidation({
        targetForm: "my_form",
        targetAgreement: "privacy_policy_agreement",
        targetAgreement2: "terms_and_conditions_agreement"
    });
    if (formResult) {
        // Ajax processing of form here
    }
    else {
        return false;
    }
}