var app = new Vue({
    el: '#app',
    data: {
        popreturn: false,
        currentSort: 'city',
        currentSortDir:'asc',
        cenlist: null,
        locationlist: [],
        statelist:["All"],
        modifiedlocationlist:[],
    },
    created: function () {
      this.fetchCensus();
    },

    methods: {
        reset(){
            // this adds a convent reset button it just reverts everything back to normal.
            app.modifiedlocationlist = app.locationlist;
            document.getElementById("cName").value = "";
            document.getElementById("min").value = "";
            document.getElementById("max").value = "";
            document.getElementById("sName").selectedIndex = "All";
        },
        checkcityname(){
            //This is to check the Enter City Name portion and is done first as its the largest
            // narrowing and will make all the following functions faster.
            let city = document.getElementById("cName").value.toLowerCase();
            if(city !== "") {
                app.modifiedlocationlist = [];
                for (let i = 0; i < app.locationlist.length; i++) {
                    let search = app.locationlist[i]["cityname"].toLocaleLowerCase().indexOf(city);
                    if (search > -1) {
                        app.modifiedlocationlist.push(app.locationlist[i]);
                    }
                }
            }
            else{
                app.modifiedlocationlist = app.locationlist;
            }
        },
        checkstates(){
            //This function checks the states search field if nothing is selected or its all we skip the loop
            let state = document.getElementById("sName");
            let selectedStates = Array.from(state.selectedOptions)
                .map(option => option.value);
            if(selectedStates.length !== 0) {
                if (selectedStates[0] !== "All") {
                    let temp = [];
                    for (let j = 0; j < selectedStates.length; j++) {
                        for (let i = 0; i < app.modifiedlocationlist.length; i++) {
                            let search = app.modifiedlocationlist[i]["state"].indexOf(selectedStates[j]);
                            if (search > -1) {
                                temp.push(app.modifiedlocationlist[i]);
                            }
                        }
                    }
                    app.modifiedlocationlist = temp;
                }
            }
        },
        checkpopulation(){
            //This function checks the population parameters and is is skipped if they are not filled.
            let min = Math.floor(document.getElementById("min").value);
            let max= document.getElementById("max").value;
            if(!!min){
                let temp = []
                for (let i = 0; i < app.modifiedlocationlist.length; i++) {
                    if (min <= app.modifiedlocationlist[i]["population"]) {
                        temp.push(app.modifiedlocationlist[i]);
                    }
                }
                app.modifiedlocationlist = temp;
            }
            if(!!max){
                max = Math.floor(max)
                let temp = []
                for (let i = 0; i < app.modifiedlocationlist.length; i++) {
                    if (max >= app.modifiedlocationlist[i]["population"]) {
                        temp.push(app.modifiedlocationlist[i]);
                    }
                }
                app.modifiedlocationlist = temp;
            }
        },
        filter() {
            this.checkcityname();
            this.checkstates();
            this.checkpopulation();
        },
        sort:function(item){
            //This is the everything but population sort
            if(item === app.currentSort){
                app.currentSortDir = app.currentSortDir==='asc'?'desc':'asc';
            }
            app.currentSort = item;
            app.modifiedlocationlist.sort((a, b) => {
                let modifier = 1;
                if (app.currentSortDir === 'desc') modifier = -1;
                if (a[app.currentSort] < b[app.currentSort]) return -1 * modifier;
                if (a[app.currentSort] > b[app.currentSort]) return 1 * modifier;
                return 0;
            })
        },
        population(item){
            //population sort is seperate so we can cast to integers
            if(item === app.currentSort){
                app.currentSortDir = app.currentSortDir==='asc'?'desc':'asc';
            }
            app.currentSort = item;
            if(app.currentSortDir === 'asc') {
                app.modifiedlocationlist.sort(function (a, b) {
                    return parseInt(a[app.currentSort]) - parseInt(b[app.currentSort])
                })
            }
            else{
                app.modifiedlocationlist.sort(function (a, b) {
                    return parseInt(b[app.currentSort]) - parseInt(a[app.currentSort])
                })
            }
        },
        fetchCensus() {
            //This is the API call and collects all the data we manipulate.
            var CenAPI = "https://api.census.gov/data/2016/pep/population?get=POP,GEONAME&for=place:*&key=646552d3622a3a24cf4e2c692b2ee925a3354f3a"
            fetch(CenAPI)
                .then(response => {
                    return response.json();
                }).then(function(result) {
                    app.cenlist = result;
                    let value;
                    app.cenlist.shift();
                    let counter = 0;
                    for( value in app.cenlist){
                        let tempStr = app.cenlist[value][1].split(",");
                        tempStr[0] = tempStr[0].replace('town','');
                        tempStr[0] = tempStr[0].replace('city','');
                        tempStr[0] = tempStr[0].replace(' ','');
                        tempStr[1] = tempStr[1].replace(' ','');
                        app.locationlist.push({
                            id: value,
                            cityname: tempStr[0],
                            state: tempStr[1],
                            population: app.cenlist[value][0],
                            statedigit:app.cenlist[value][2],
                        })
                        if(tempStr[1] !== app.statelist[counter]){
                            counter++;
                            app.statelist.push(tempStr[1])
                        }
                    }
                    app.modifiedlocationlist = app.locationlist;
                    app.popreturn = true;
                    document.body.style.backgroundColor = "aliceblue"
            })
        },
    },
})

