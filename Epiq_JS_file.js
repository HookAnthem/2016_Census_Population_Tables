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
        filter() {
            app.modifiedlocationlist = []
            let city = document.getElementById("cName").value.toLowerCase();
            for(let i = 0; i < app.locationlist.length; i++){
                let search = app.locationlist[i]["cityname"].toLocaleLowerCase().indexOf(city);
                if(search > -1){
                    app.modifiedlocationlist.push(app.locationlist[i])
                }
            }
            let state = document.getElementById("sName");
            let selectedStates = Array.from(state.selectedOptions)
                .map(option => option.value)
            if(selectedStates.length !== 0) {
                if (selectedStates[0] !== "All") {
                    let temp = []
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
            let min = Math.floor(document.getElementById("min").value);
            let max= Math.floor(document.getElementById("max").value);
            if(typeof min !=='undefined'){
                let temp = []
                for (let i = 0; i < app.modifiedlocationlist.length; i++) {
                    if (min > app.modifiedlocationlist[i]["population"]) {
                        temp.push(app.modifiedlocationlist[i]);
                    }
                }
                app.modifiedlocationlist = temp;
            }
            if(typeof max !== 'undefined'){
                let temp = []
                for (let i = 0; i < app.modifiedlocationlist.length; i++) {
                    if (max < app.modifiedlocationlist[i]["population"]) {
                        temp.push(app.modifiedlocationlist[i]);
                    }
                }
                app.modifiedlocationlist = temp;
            }
        },
        sort:function(item){
            if(item === app.currentSort){
                app.currentSortDir = app.currentSortDir==='asc'?'desc':'asc';
            }
            app.currentSort = item;
        },
        fetchCensus() {
            var CenAPI = "https://api.census.gov/data/2016/pep/population?get=POP,GEONAME&for=place:*&key=646552d3622a3a24cf4e2c692b2ee925a3354f3a"
            fetch(CenAPI)
                .then(response => {
                    return response.json();
                }).then(function(result) {
                    app.cenlist = result;
                    console.log(result);
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
            })
        },
    },
    computed:{
        sortedlocationlist:function() {
            return app.modifiedlocationlist.sort((a,b) => {
                let modifier = 1;
                if(app.currentSortDir === 'desc') modifier = -1;
                if(a[app.currentSort] < b[app.currentSort]) return -1 * modifier;
                if(a[app.currentSort] > b[app.currentSort]) return 1 * modifier;
                return 0;
            })
        }
    },
})

