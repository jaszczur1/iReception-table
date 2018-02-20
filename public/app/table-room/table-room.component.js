room.component('tableR', {
    templateUrl: "app/table-room/table-room.temp.html",
    controller: function getListTable(idTable) {
        
        var roomName =['APSC.MeetingRoom.01','APSC.MeetingRoom.02','APSC.VideoConfRoom'];
        var NameTemp;
        
        this.table = [];
        var self = this;
        var data_to_html;

        setInterval(function () {
            idTable.getEvent().then(function (res) {
                data_to_html(res.data);
            });

        }, 2000);
         
        function getRoomName() {
            NameTemp = window.location;
            NameTemp = NameTemp.toString();
            NameTemp =NameTemp.split('/');
            if(NameTemp[3] === 'room1') return roomName[0];
            if(NameTemp[3] === 'room2') return roomName[1];
            if(NameTemp[3] === 'conference') return roomName[2]; 
            
        }
 
        function data_to_html(data) {
            self.table = [];
            console.log(data.value);
            array_data = data.value;

            for (var i = 0; i < array_data.length; i++) {
                try {
                    Start = moment(array_data[i].Start.DateTime).add(1, 'h').format();
                    End = moment(array_data[i].End.DateTime).add(1, 'h').format();
                    
                    if (array_data[i].Location.DisplayName !== getRoomName()
                            || array_data[i].IsCancelled === true
                            || moment().isAfter(End))
                            continue;
         
                    if (moment().isSameOrBefore(Start)||moment().isBetween(Start, End) ) {
                        self.table.push(array_data[i]);
                        console.log(array_data[i])
                        console.log(self.table.length)
                        Start = Start.substring(11, 16);
                        End = End.substring(11, 16);
                        array_data[i].Start.DateTime = Start;
                        array_data[i].End.DateTime = End;
                        break;
                    }

                } catch (e) {
                    console.log(e);
                }
            }
            for (var item_out in array_data) {
                for (var item_in in array_data[item_out].Attendees) {
                    if (array_data[item_out].Attendees[item_in].EmailAddress.Address === "APSC.iReception@advantech.com")
                        array_data[item_out].Attendees.splice(item_in, item_in);
                }
            }
            if (self.table.length === 0)
                self.table.push({"Location": {"DisplayName": getRoomName()},
                "Start.DateTime":"-", "End.DateTime":"-", "EmailAddress":{"Name":"-"}, "Subject":"no events"});
        }
    }
});

room.factory('idTable', function ($http, $interval) {

    var table = {};
    table.getEvent = function () {
        return $http.get('getToken/getCalendarFromEvent')
    }

    table.refreshToken = function () {
        return $http.get('getToken')
    };
    
    return table;
})