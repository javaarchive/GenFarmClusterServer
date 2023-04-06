$(function(){

    console.log("JS Init...");

    function setStatus(text){
        $("#socket-status").text(text);
    }

    setStatus("JS Init...");

    const socket = io();

    setStatus("Socket init...");

    setInterval(() => {
        socket.emit("ping", {
            clientTime: Date.now()
        }, function(data){
            setStatus("Socket roundtrip ping: " + (Date.now() - data.clientTime) + "ms, client -> server time: " + (Date.now() - data.serverTime) + "ms");
        });
    }, 1000);

    function buildClientController(data){
        let root = $("<div></div>").addClass("row");
        let basic = $("<pre></pre>").addClass("col-4").text("Name: " + data.name + " \nJoined At: " + (new Date(data.joinedAt)).toLocaleString() + " \nRunning Tasks: " + data.runningTasks.length + "\nWeight: " + data.weight);
        root.append(basic);
        let quickConfig = $("<div></div>").addClass("col-2");
        let reweightInput = $("<input></input>").attr("type", "number").val(data.weight).addClass("form-control");
        let reweightBtn = $("<div></div>").addClass("btn btn-warning").text("Change weight");
        quickConfig.append(reweightInput);
        quickConfig.append(reweightBtn);
        reweightBtn.click(function(){
            socket.emit("modify", data.sid, {
                weight: reweightInput.val()
            }, refreshNodeData);
        });
        root.append(quickConfig);
        return root;
    }

    function refreshNodeData(){
        $("#client-config").text("Loading...");
        socket.emit("requestNodeData", function(data){
            // $("#client-config").text(JSON.stringify(data,null,4));
            $("#client-config").text("");
            for(clientData of data){
                $("#client-config").append(buildClientController(clientData));
            }
        });
    }

    $("#refresh-client-config").click(refreshNodeData);

    let myName = "controller-" + Date.now();

    socket.on("connect", () => {
        socket.emit("controller"); // don't get tasks pls
        socket.emit("rename", myName);
        setStatus("Connected...");
    });
});