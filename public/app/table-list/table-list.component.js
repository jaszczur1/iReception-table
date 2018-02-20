tab.component('tableL', {
    templateUrl: "app/table-list/table-list.temp.html",
    controller: function (idTable, $http) {

        this.table = [];
        var self = this;
        var data_to_html;

        this.message = function ($event) {
            var supply = $($event.target).text();
            $.ajax({
                url: "getToken/mail",
                data: {
                    host: 'michal.jadczak@advantech.com', // from event object           
                    titleEventObiect: supply,
                    message: 'kanapki w recepcji' + '\r'
                },
                success: function (data, textStatus, jqXHR) {

                    $.notify('Wiadomosc wyslana!', {
                        offset: {
                            x: 600,
                            y: 250
                        }
                    });
                }
            })
        };

        setInterval(function () {
            idTable.getEvent().then(function (res) {
                data_to_html(res.data);
            });
            idTable.refreshToken();
        },
                5000);

        function data_to_html(data) {
            self.table = [];
            console.log(data.value);
            array_data = data.value;

                for (var i = 0; i < array_data.length; i++) {
                    try {
                         
                        Start = moment(array_data[i].Start.DateTime).add(1, 'h').format();
                        End = moment(array_data[i].End.DateTime).add(1, 'h').format();
                        if( array_data[i].IsCancelled === true|| moment().isAfter(End)) continue;
                       
                        self.table.push(array_data[i]);
                        Start = Start.substring(11, 16);
                        End = End.substring(11, 16);
                        array_data[i].Start.DateTime = Start;
                        array_data[i].End.DateTime = End;

                    } catch (e) {
                        console.log(e);
                    }
                }
                // loop for removed name iReception

                for (var item_out in array_data) {
                    for (var item_in in array_data[item_out].Attendees) {
                        if (array_data[item_out].Attendees[item_in].EmailAddress.Address === "APSC.iReception@advantech.com")
                            array_data[item_out].Attendees.splice(item_in, item_in);
                    }
                }
                if (self.table.length === 0) self.table.push({"Location": {"DisplayName": ""}}); 
    }
}});

tab.factory('idTable', function ($http, $interval) {

    var table = {};
    table.getEvent = function () {
        return $http.get('getToken/getCalendarFromEvent')
    }

    table.refreshToken = function () {
        return $http.get('getToken');
    };

    return table;
})
