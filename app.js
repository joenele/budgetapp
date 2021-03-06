//  BUDGET CONTROLLER
var budgetController = (function() { //IIFE - new invisible scope
    
    var Expense = function (id, description, value) { // function constructor 
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    // calculates the percentage of total
    Expense.prototype.calcPercentage = function(totalIncome){ 
        if (totalIncome > 0){

        this.percentage = Math.round((this.value / totalIncome) * 100);
        }else {
            this.percentage = -1;
        }
    };

    // returns the percentage of total
    Expense.prototype.getPercentage = function () {
        return this.percentage;
    };


    var Income = function (id, description, value) { // function constructor 
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(cur) {
            sum += cur.value
        });
        data.totals[type] = sum;
    };

    var data = { // data structure
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1 //   doesn't exist
    };

    return {
        addItem: function(type, des, val) {
            var newItem, ID;

            //  Create New ID
            if(data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

            // Create new item based on 'inc' or 'exp'
            if(type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            // Push it into our data structure
            data.allItems[type].push(newItem); // add at the end of our array

            // Return the new element
            return newItem;
        },

        deleteItem: function(type, id) {
            var ids, index;

        //  id = 6
        //  data.allItems[type][id];
        //  ids = [1 2 4 6 8]
        //  index = 3

            var ids = data.allItems[type].map(function(current) { //map function returns a new array
                return current.id;
            });

            index = ids.indexOf(id);

            if (index !== -1){
                data.allItems[type].splice(index, 1);
            }
        },

        calculateBudget: function () {

            //calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            //calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            //calculate the percentage of income that we spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp/data.totals.inc) * 100);
            } else {
                data.percentage = -1; //    When there is no percentage to calculate;
            }

            // Expense = 100 and income = 200, spent 50% = 100/200 = 0.5 * 100
        },

        calculatePercentages: function() {

            /*
            a = 20
            b = 10
            c = 40
            income = 100
            a = 20/100 = 20%
            b = 10/100 = 10%
            c = 40/100 = 40%
            */
           data.allItems.exp.forEach(function(cur) {
               cur.calcPercentage(data.totals.inc);
           });
        },


        getPercentages: function() {
            var allPerc = data.allItems.exp.map(function(cur) {
                return cur.getPercentage();
            });
            return allPerc;
        },


        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },

        testing: function() {
            console.log(data);
        }
    };
   
})();//create a new scope not visible from outside scope



//  UI CONTROLLER
var UIController = (function() {

    var DOMstrings = { //objects
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    var formatNumber = function(num, type) {
        var numSplit, int, dec;

        /*
        + or - before number
        exactly 2 decimal points
        comma separating the thousands

        2310.4567 -> 2,310.46
        2000 -> 2,000.00
        */

        num = Math.abs(num);  // method of the math prototype
        num = num.toFixed(2); // method of the number prototype

        numSplit = num.split('.');

        int = numSplit[0];
        if(int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3,3); 
            // input 2310, output 2,310
        }

        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;

    };



    //pass a callback function into nodeListForEach function
    var nodeListForEach = function(list, callback) {
        for (var i = 0; i < list.length; i++){
            callback(list[i], i);
        }
    };
    
    return {
        getinput: function() {
            return {
                type: document.querySelector(DOMstrings.inputType).value, // Will be either inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                //convert string to a number
                 value: parseFloat(document.querySelector(DOMstrings.inputValue).value),
            }
        },

        addListItem: function (obj, type) {

            // Create HTML string with placeholder text
            var html, newHTML, element;

            if(type === 'inc'){
                element = DOMstrings.incomeContainer;

                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><ion-icon name="close-circle-outline"></ion-icon></button></div></div></div>';
            } else if (type ==='exp') {
                element = DOMstrings.expensesContainer;

                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><ion-icon name="close-circle-outline"></ion-icon></button></div></div></div>';
            }

            // Replace the placeholder text with some actual data
            newHTML = html.replace('%id%', obj.id);
            newHTML = newHTML.replace('%description%',  obj.description);
            newHTML = newHTML.replace('%value%',  formatNumber(obj.value, type));

            // Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHTML);
        },

        deleteListItem: function(selectorID) {
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        clearFields: function () {
            var fields, fieldsArr;

            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

            fieldsArr = Array.prototype.slice.call(fields); //slice method returns array

            fieldsArr.forEach(function(current, index, array) {
                current.value = "";// resets all fields to empty when button is pressed
            });

            fieldsArr[0].focus(); // sets focus back to textbox fields
        },

        displayBudget: function(obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');

            if(obj.percentage > 0){
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
        },

        displayPercentages: function(percentages){

            //returns a NODE list - each element is stored in a node
            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

            nodeListForEach(fields, function(current, index) {

                if(percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });
        },

        displayMonth: function() {
            var now, months, month, year;

            now = new Date();

            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

            month = now.getMonth();

            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month]+ ' ' + year;
        },

        changedType: function() {

             var fields = document.querySelectorAll(
                 DOMstrings.inputType + ',' +
                 DOMstrings.inputDescription + ',' +
                 DOMstrings.inputValue);

             nodeListForEach(fields, function(cur) {
                cur.classList.toggle('red-focus');
             });

             document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        },

        getDOMstrings: function () {
            return DOMstrings;
        }
    };
})();


//  GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl) {

    var setupEventListeners = function() {
        var DOM = UICtrl.getDOMstrings();
    
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
     
        document.addEventListener('keypress', function(event) {
            if(event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);

    };

    var updateBudget = function () {

        //  1. Calculate the budget
        budgetCtrl.calculateBudget();

        //  2. Return the budget
        var budget = budgetCtrl.getBudget(); // stores budget in the varibale - budget


        //  3. Display the budget on the UI
        UICtrl.displayBudget(budget);
    };

    var updatePercentages = function () {

        // 1. Calculate the percentages
        budgetCtrl.calculatePercentages();

        // 2. Read percentages from the budget controllers
        var percentages = budgetCtrl.getPercentages();

        // 3. Update the UI with the new percentages
        UICtrl.displayPercentages(percentages);
    };

    var ctrlAddItem = function() {
        var input, newItem;

        //  1. Get the field input data
        input = UICtrl.getinput();

        if (input.description !== "" && !isNaN(input.value) && input.value > 0){
        //  2. Add the item to the budget controller
        newItem = budgetCtrl.addItem(input.type, input.description, input.value);

        //  3. Add the new item to the UI
        UICtrl.addListItem(newItem, input.type);

        //  4. Clear the fields
        UICtrl.clearFields();

        //  5. Calculate and update budget
        updateBudget();
        }

        //  6. Calculate and update percentages
        updatePercentages();

    };

    var ctrlDeleteItem = function(event) {
        var itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if(itemID) {

            //inc-1
            splitID = itemID.split('-'); //breaks up the string to remove '-'
            type = splitID[0];
            ID = parseInt(splitID[1]);

            //  1. Delete the item from the data structure
            budgetCtrl.deleteItem(type, ID);

            //  2. Delete the item from the UI
            UICtrl.deleteListItem(itemID);

            //  3. Update and show the new budget
            updateBudget();

            //  4. Calculate and update percentages
            updatePercentages();
        }
    };

    return {
        init: function() {
            console.log('Application has started.');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    };

})(budgetController, UIController);
 
controller.init(); // must be used for event listeners
   

