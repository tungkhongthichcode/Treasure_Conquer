// Connect server

var socket = io("http://localhost:5500");
socket.emit("allUsers");

// User constants

const initialScr = $('.initial_screen');
const storyBtn = $('.initial_screen #storyBtn');
const storyScr = $('.initial_screen .story_screen');
const storyText = $('.initial_screen .story_screen .text');
let usernameInputDiv = $('.initial_screen #usernameInputDiv');
let usernameInput = $('.initial_screen #usernameInput');
let newRoomBtnDiv = $('.initial_screen #newRoomBtnDiv');
const newRoomBtn = $('.initial_screen #newRoomBtn');
let roomIDInput = $('.initial_screen #roomCodeInput');
const joinRoomBtn = $('.initial_screen #joinRoomBtn');

const NavUpBtn = $('.navigate .up')
const NavPageBtn = $('.navigate .page-mark')
const NavDownBtn = $('.navigate .down')

const restroomScr = $('.restroom_screen');
const roomIDMessage = $('.restroom_screen h3');
const leaveRoomBtn = $('.restroom_screen #leaveRoomBtn');
const startGameBtn = $('.restroom_screen #startGameBtn');
const player_list = $(".player_list #show_player_list");
const colorOptns = $('.restroom_screen .color_options .option');
const sliders = $('.restroom_screen .customize div');
const ranges = $('.restroom_screen .customize div input');
const characterSVG = $('.update .character');

const gameScr = $('.game_screen');
const roleName = $('#role');
const activateBtn = $('.game_screen #activateBtn');
const voteBtn = $('.game_screen #voteBtn');
const chests = $('.game_screen .chests .option');
const roleScr = $('.role_screen');
const roleMes = $('#role_mes');
const roleDesc = $('#role_desc');
const roleChr = $('.role_screen .character');
const activateScr = $('.activate_screen');
const voteScr = $('.vote_screen');

let selectedColor;
let playerBoxes = $(".player_list #show_player_list .box");
let room_size = playerBoxes.length;
let temp = Math.floor(Math.random() * room_size);
const role = ["Captain", "Killer", "Pirate"];
const killerNum = 2;
characterSVG.html($('.textures .spriteDiv').html());


$(window).on('mouseup', function(e) {
    const container = $('.activate_screen, .story_screen');
    if (!container.is(e.target) && container.has(e.target).length === 0){
        container.fadeOut();
    }
});

// User events

let players = [];
let leavePlayers = [];
let inLeaveState = false;

class Player{
    constructor(id, username){
        this.id = id;
        this.username = username;
    }
}

const randomRole = function() {
    if (temp === 0) {
        return role[0];
    }
    else {
        if (temp < 3) {
            return role[1];
        }
        else return role[2];
    }
}

const characterRole = function() {
    roleMes.text(randomRole());
    if (temp === 0) {
        roleDesc.text("Nhiệm vụ của bạn là tìm ra Killer đang trà trộn trong đoàn, sống sót và chiến thắng cùng Pirate.\n Mỗi lượt tìm kho báu, bạn có quyền theo dõi tình hình 1 kho báu bất kỳ trước khi chọn kho báu. Nếu Killer phát hiện bạn là Captain, bạn thua.\n Bạn biết được thân phận những thủy thủ trong đoàn.");
    }
    else {
        if (temp <= killerNum) {
            roleDesc.text("Nhiệm vụ của bạn là cố gắng sống sót và kiếm được nhiều tiền nhất.\n Mỗi lượt săn, bạn có thể giết 1 Pirate nếu chỉ có Pirate đó săn cùng kho báu với bạn. Nếu giết thành công 1 Pirate, bạn lấy được thông tin của Captain. Nếu như bạn thua sau các lượt chọn kho báu, bạn vẫn có thể thắng nếu như bạn tìm ra thân phận của Captain.\n Bạn không biết được thân phận những thủy thủ trong đoàn.");
        }
        else roleDesc.text("Nhiệm vụ của bạn là tìm giết Killer đang trà trộn trong đoàn.\n Bạn không nhớ được thân phận những thủy thủ trong đoàn. Tham gia săn kho báu cùng đồng minh sẽ giúp bạn tăng điểm thân mật. Đạt đủ điểm thân mật bạn sẽ nhận được thông tin của thủy thủ trong đoàn");
    }
    roleChr.html($('.textures .spriteDiv').html());
    roleChr.find('.cls-8').css('fill', selectedColor);
}

const randomRoomID = function() {
    return Math.floor(Math.random() * 90000) + 10000;
}

const chestList = function(ul, n) {
    let chest;
    for (let i = 0; i < n; i++){
        chest = $('<li>').addClass('option').text(i + 1);
        ul.append(chest);
    }
}

const createChestLists = function(n) {
    const list_60 = $('.game_screen .chests .c60');
    const list_80 = $('.game_screen .chests .c80');
    const list_120 = $('.game_screen .chests .c120');

    const n120 = Math.floor(n / 6);
    const n60 = Math.floor((n - 1 - n120) / 2);
    const n80 = Math.floor((n - 2 - n120) / 2);
    console.log(n - 2 - n120);
    console.log(n80);

    chestList(list_60, n60);
    chestList(list_80, n80);
    chestList(list_120, n120);
}

// A player base on id (in players)
const getCurrentPlayer = function(id) {
    return players.find(player => player.id === id);
}

// A player base on id (in leavePlayers)
const getLeavePlayer = function(id) {
    return leavePlayers.find(player => player.id === id);
}

const getRoomUsers = function(room) {
    return players.filter(player => player.room === room);
}

const getActiveRooms = function() {
    return new Set(players.map(player => player.room));
}

// A list of active player names
const getActiveNames = function() {
    return players.map(player => player.username);
}

// A list of player names in leaveRoom state
const getLeaveNames = function() {
    return leavePlayers.map(player => player.username);
}

// 
const getUsedColors = function() {
    return players.map(player => player.colorID);
}

// Default color of a player
const getDefaultColor = function() {
    for (let i = 0; i < colorOptns.length; i++) {
        if (!colorOptns.eq(i).hasClass('chosen')){
            return i;
        }
    }
    return -1;
}

/*
* INITIAL SCREEN
*/

storyBtn.on('click', function() {
    storyScr.css('display', 'flex');
});

newRoomBtn.on("click", function() {
    const activeUsernames = getActiveNames(players);
    const leaveUsernames = getLeaveNames();
    const rooms = getActiveRooms(players);
    const roomID = randomRoomID().toString();
    while (rooms.has(roomID)){
        roomID = randomRoomID().toString();
    }
    if (!inLeaveState){
        // Check valid
        if (!usernameInput.val() || usernameInput.val().length > 16){
            alert("Your username must have around 1-16 character(s)!!!");
            return;
        }
        if (activeUsernames.includes(usernameInput.val()) || leaveUsernames.includes(usernameInput.val())){
            alert("Existed username!!!");
            return;
        }
    
        // Handle room
        const username = usernameInput.val();
        socket.emit("joinRoom", username, roomID);
        roomIDMessage.text("ID: " + roomID);

        // Handle color
        setTimeout(() => {
            const index = getDefaultColor();
            colorOptns.eq(index).addClass('selected');
            selectedColor = colorOptns.eq(index).css('background-color');
            player_list.find('.current').find('.color').find('.hatcls-2').css('fill', selectedColor);
            characterSVG.find('.cls-8').css('fill', selectedColor);
            socket.emit("selected", roomID, index);
        }, 100);

        // Modify swap room
        usernameInputDiv.html(``);
        usernameInputDiv.append(`<p>Welcome ${usernameInput.val()}</p>`);
        $('.initial_screen h4').remove();
    }
    else {
        let currentPlayer = getLeavePlayer(socket.id);
        socket.emit("joinRoom", currentPlayer.username, roomID);
        roomIDMessage.text("ID: " + roomID);

        // Handle color
        setTimeout(() => {
            const index = getDefaultColor();
            colorOptns.eq(index).addClass('selected');
            selectedColor = colorOptns.eq(index).css('background-color');
            player_list.find('.current').find('.color').find('.hatcls-2').css('fill', selectedColor);
            characterSVG.find('.cls-8').css('fill', selectedColor);
            socket.emit("selected", roomID, index);
        }, 100);
    }
    // Handle swap room
    usernameInput.val('');
    roomIDInput.val('');
    restroomScr.css('display', "grid");
    initialScr.css('display', "none");
});

storyBtn.on("click", function() {
    storyScr.css('display', 'block')
});

joinRoomBtn.on('click', function() {
    const rooms = getActiveRooms(players);
    const roomID = roomIDInput.val();
    if (!inLeaveState){
        // Check valid
        const activeUsernames = getActiveNames(players);
        const leaveUsernames = getLeaveNames();
        if (!usernameInput.val() || usernameInput.val().length > 16){
            alert("Your username must have around 1-16 character(s)!!!");
            return;
        }
        if (activeUsernames.includes(usernameInput.val()) || leaveUsernames.includes(usernameInput.val())){
            alert("Existed username!!!");
            return;
        }
        if (!roomIDInput.val()){
            alert("Forgot to enter room ID!!!");
            return;
        }
        if (!rooms.has(roomID)){
            alert("Invalid room ID!!!");
            return;
        }

        // Handle room
        const username = usernameInput.val();
        socket.emit("joinRoom", username, roomID);
        roomIDMessage.text("ID: " + roomID);

        // Handle color
        setTimeout(() => {
            const index = getDefaultColor();
            colorOptns.eq(index).addClass('selected');
            selectedColor = colorOptns.eq(index).css('background-color');
            player_list.find('.current').find('.color').find('.hatcls-2').css('fill', selectedColor);
            characterSVG.find('.cls-8').css('fill', selectedColor);
            socket.emit("selected", roomID, index);
        }, 100);

        // Modify swap room
        usernameInputDiv.html(``);
        usernameInputDiv.append(`<p>Welcome ${usernameInput.val()}</p>`);
        $('.initial_screen h4').remove();
    }
    else {
        // Check valid
        if (!roomIDInput.val()){
            alert("Forgot to enter room ID!!!");
            return;
        }
        if (!rooms.has(roomID)){
            alert("Invalid room ID!!!");
            return;
        }

        // Handle room
        let currentPlayer = getLeavePlayer(socket.id);
        socket.emit("joinRoom", currentPlayer.username, roomID);
        roomIDMessage.text("ID: " + roomID);

        // Handle color
        setTimeout(() => {
            const index = getDefaultColor();
            colorOptns.eq(index).addClass('selected');
            selectedColor = colorOptns.eq(index).css('background-color');
            player_list.find('.current').find('.color').find('.hatcls-2').css('fill', selectedColor);
            characterSVG.find('.cls-8').css('fill', selectedColor);
            socket.emit("selected", roomID, index);
        }, 100);
    }

    // Handle swap room
    ranges.hide();
    startGameBtn.hide();
    usernameInput.val('');
    roomIDInput.val('');
    restroomScr.css('display', "grid");
    initialScr.css('display', "none");
});
// Navigate Story
const updateNav = function(currentPage){   
    for (let i = 0; i < NavPageBtn.length; i++){
    storyText.eq(i).css("display", "none");
    NavPageBtn.eq(i).css("background-image", "url('Textures/Nagative/Normal.png')");
    if (i == currentPage) {
        storyText.eq(i).css("display", "block");
        NavPageBtn.eq(i).css("background-image","url('Textures/Nagative/Active.png')");

    }
}}
let currentPage = 0;
NavUpBtn.on('click', function() {
    currentPage = (currentPage + 2)%3;
    updateNav(currentPage);
});
NavDownBtn.on('click', function() {
    currentPage = (currentPage + 1)%3;
    updateNav(currentPage);
});
for (let i = 0; i < NavPageBtn.length; i++){
    NavPageBtn.eq(i).on('click', function() {
        currentPage = i;
        updateNav(currentPage);
})}


/*
* RESTROOM SCREEN
*/

leaveRoomBtn.on('click', function() {
    // console.log(1);
    // players.forEach(function(player){
    //     console.log(player);
    // })
    // console.log(2);
    // leavePlayers.forEach(function(player){
    //     console.log(player);
    // })
    inLeaveState = true;
    let currentPlayer = getCurrentPlayer(socket.id);
    colorOptns.eq(currentPlayer.colorID).removeClass('selected');
    let leaveIndex = players.indexOf(currentPlayer);
    if (leaveIndex > -1){
        players.splice(leaveIndex, 1);
    }
    socket.emit("leaveRoom", leaveIndex);   
    initialScr.css('display', "flex");
    restroomScr.css('display', "none");
});

startGameBtn.on('click', function() {
    const roomID = getCurrentPlayer(socket.id).room;
    room_size = playerBoxes.length;
    if (room_size < 2 || room_size > 12){
        alert("Game should be started with around 6-12 players!!!");
        return;
    }
    socket.emit("startGame", roomID);
});

for (let i = 0; i < sliders.length; i++) {
    let range = sliders.eq(i).find('input');
    let val = sliders.eq(i).find('span');
    val.text(range.val());
    range.on('input', function() {
        const roomID = getCurrentPlayer(socket.id).room;
        socket.emit("customize", roomID, range.val(), i);
    });
}

for (let i = 0; i < colorOptns.length; i++){
    colorOptns.eq(i).on('click', function() {
        const roomID = getCurrentPlayer(socket.id).room;
        const elem = $('.color_options .selected');
        if (elem != null) elem.removeClass('selected');
        colorOptns.eq(i).addClass('selected');
        selectedColor = colorOptns.eq(i).css('background-color');
        player_list.find('.current').find('.color').find('.hatcls-2').css('fill', selectedColor);
        characterSVG.find('.cls-8').css('fill', selectedColor);
        socket.emit("selected", roomID, i);
    });
}

/*
* GAME SCREEN
*/

activateBtn.on('click', function() {
    activateScr.css('display', 'flex');
});

voteBtn.on('click', function() {
    voteScr.css('display', 'grid');
});

for (let i = 0; i < chests.length; i++) {
    chests.eq(i).on('click', function() {
        const elem = $('.chests .option.selected');
        if (elem != null) elem.removeClass('selected');
        chests.eq(i).addClass('selected');
    });
}

// Socket events

socket.on("allUsers", function(activeUsers, leaveUsers){
    players = activeUsers;
    leavePlayers = leaveUsers;
});

socket.on("updateUsers", function(roomUsers) {
    currentPlayer = getCurrentPlayer(socket.id);
    if (roomUsers.length){
        if (roomUsers[0].username == currentPlayer.username){
            ranges.show();
            startGameBtn.show();
        }
    } 
    player_list.html(``);
    roomUsers.forEach(player => {
        const playerDiv = $('<div>').addClass('box');
        playerDiv.append($('.textures .colorDiv').html());
        playerDiv.append(`<p>${player.username}</p>`);
        player_list.append(playerDiv);
        if (player.id === socket.id) {
            $(".player_list #show_player_list .box:last-child").addClass('current');
        }
    });
    playerBoxes = $(".player_list #show_player_list .box");
});

socket.on("startGame", function() {
    room_size = playerBoxes.length;
    temp = Math.floor(Math.random() * room_size);
    gameScr.css('display', "grid");
    roleName.text("Role: " + randomRole());
    createChestLists(room_size);
    if (temp > killerNum) {
        activateBtn.hide();
    }
    setTimeout(function() {
        roleScr.fadeOut();
    }, 8000);
    characterRole();
    restroomScr.css('display', "none");
    roleScr.css('display', "flex");
});

socket.on("customize", function(value, i) {
    sliders.eq(i).find('span').text(value);
});

socket.on("updateColors", function(roomUsers) {
    const elem = $('.color_options .chosen');
    if (elem != null) elem.removeClass('chosen');
    for (let i = 0; i < roomUsers.length; i++){
        let circle_i = colorOptns.eq(roomUsers[i].colorID);
        if (roomUsers[i].id !== socket.id && roomUsers[i].colorID > -1){
            let chosenColor = circle_i.css('background-color');
            circle_i.addClass('chosen');
            playerBoxes.eq(i).find('.color').find('.hatcls-2').css('fill', chosenColor);
            characterSVG.find('.cls-8').css('fill', selectedColor);
        }
        else {
            selectedColor = circle_i.css('background-color');
            player_list.find('.current').find('.color').find('.hatcls-2').css('fill', selectedColor);
            characterSVG.find('.cls-8').css('fill', selectedColor);
        }
    };
});
