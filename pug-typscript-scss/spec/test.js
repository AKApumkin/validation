const operations = require('../dist/js/validator.js')

describe("Baseline test", function() {
    it("contains spec with an expectation", function() {
      expect(true).toBe(true);
    });
});

// sets the regex for the validation, the first one includes Chinese, Korean and Japanese
let regex = /^[-'a-zA-Z#\s\u4e00-\u9eff]{1,}$/i;
let regexEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
let regexPhone = /^(?:(?:\(?(?:00|\+)([1-4]\d\d|[1-9]\d?)\)?)?[\-\.\ \\\/]?)?((?:\(?\d{1,}\)?[\-\.\ \\\/]?){0,16})(?:[\-\.\ \\\/]?(?:#|ext\.?|extension|x)[\-\.\ \\\/]?(\d+))?$/i
let regexAddr =  /^[-'a-zA-Z0-9\s_.,!\"\'\$\&\;\?\u4e00-\u9eff]{1,}$/i;


describe("Text input which allows A-Z, spaces and chinese/korean/japanese characters", function() {
    it("contains spec with an expectation", function() {

        // tests that lowercase latin chracters can be submited
        expect(regex.test("a b c d e f g h i j k l m n o p q r s t u v w x y z # ' -")).toBe(true);

        // checkts that uppercase latin characters can be submited
        expect(regex.test("A B C D E F G H I J K L M N O P Q R S T U V W X Y Z")).toBe(true);

        // checks that all the numbers cannot be sumbited
        let numbers_test_array = ["0","1","2","3","4","5","6","7","8","9"];
        for(i=0; i< numbers_test_array.length; i++){
            expect(regex.test(numbers_test_array[i])).toBe(false);
        }
        expect(regex.test("0123456789")).toBe(false);

        // checks that all the special characters apart from # - ' cannot be submitted
        let special_chracters_test_array = ["<",">",",","{","}","?","^","&","*","!","@","$","(",")","[","]","\\","/",".","+","=","_","`","~"];
        for(i=0; i< special_chracters_test_array.length; i++){
            expect(regex.test(special_chracters_test_array[i])).toBe(false);
        }
    });
});


describe("Text input which only allows for emails to inputed", function() {
    it("contains spec with an expectation", function() {
        expect(regexEmail.test("test@test.com")).toBe(true);
        expect(regexEmail.test("test(at)test.com")).toBe(false);
        expect(regexEmail.test("test.com")).toBe(false);
    });
});