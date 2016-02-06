function AppViewModel() {
    this.searchName = ko.observable("Bert");



    // Activates knockout.js
ko.applyBindings(new AppViewModel());