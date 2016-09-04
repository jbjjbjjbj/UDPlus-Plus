console.log("Uddata++ starting");

//Themes availeble
var themes = {
"default" : {"navBar": "#438eb9", "navbarIcon" : "#FFFFFF", "rightDropdown": "#62a8d1", "name": "default"},
"dark" : {"navBar": "rgb(43, 43, 43)", "navbarIcon" : "#FFFFFF", "rightDropdown": "rgb(43, 43, 43)", "name": "dark"},
"green" : {"navBar": "#539e24", "navbarIcon" : "#FFFFFF", "rightDropdown": "rgb(53, 115, 6)", "name": "green"},
"red": {"navBar": "#B22222", "navbarIcon": "#FFFF99", "rightDropdown": "rgba(0, 0, 0, 0.2)", "name": "red"},
"blue": {"navBar": "#0375B4", "navbarIcon": "#FFFFFF", "rightDropdown": "rgba(0, 0, 0, 0.2)", "name": "blue"}};


//Changes the current Uddata+ logo to the transparent version that allows the color of the navbar to be visible.
$("#navbar>div>div>a>img").attr("src",chrome.extension.getURL("UddataLogo.png"));


if($("#language > a").html() == "English"){
	setStorage({"lang": "dansk"});
}else{
	setStorage({"lang": "engelsk"});
}


// <---- HOMEWORK MARKING
var mark;

getStorage('homework', function (obj) {
	if (!chrome.runtime.error) {
		if (window.location.href.indexOf("skema")) {
			mark = obj.homework;
		}
	}
});

chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		if (request.type == "homeworkChange"){
			mark = request.checked;
			markHomework();
		}
	}
);

$("head").append("<style>svg .GEIF5TWDNX rect{fill-opacity:0.75 !important;}</style>");

function markHomework(){
	if(mark){
		$('.skemaBrikGruppe>.GI4H3JYPX>g>text>title').each(function(index) {
			if ($(this).text().toUpperCase().includes("LEKTIE")) {
				//$(this).parent().parent().parent().find('rect').css('fill-opacity', '0.0');
				//$(this).parent().parent().parent().find('rect').css('fill', '#ff0000');
				$(this).parent().parent().parent().find('rect').each(function () { this.style.setProperty("fill", "#ff0000", 'important' ); });
			}
		});
	}else{
		$('.skemaBrikGruppe>g.GI4H3JYPX>g>text>title').each(function(index) {
			if ($(this).text().toUpperCase().includes("LEKTIE")) {
				//$(this).parent().parent().parent().find('rect').css('fill', 'rgb(255,239,197)');
				$(this).parent().parent().parent().find('rect').removeAttr("style");
			}
		});
	}
}

setInterval(function() {
	markHomework();
}, 500);

curtheme = "Default";

getStorage('theme', function (obj) {
	if (!chrome.runtime.error) {
		curtheme = obj.theme;
		runTheme();
	}
});


//Changes color off element
function runTheme(){
	for (var T in curtheme) {
		changeColor(colorElements[T], curtheme[T]);
	}
}

$(document).ready(function(){
	$("#sidebar-collapse").hide();

});

//Wait for change in theme from popup
chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		if (request.type == "theme"){
			curtheme = request.theme;
			location.reload();
		}
	}
);

//Get current freme from settings
getStorage('theme', function (obj) {
	if (!chrome.runtime.error) {
		curtheme = obj.theme;
		runTheme();
	}
});


function activ_plus_menu() {
	var pagecontent = $(".page-content");
	var homework = true;
	var hideTask = true;
	pagecontent.html("");

	$.ajax({
		type: "GET",
		url: chrome.extension.getURL('/settings.html'),
		dataType: "html",
		success: function(data, textStatus, errorThrown){

			var toAdd = data;

			//Firefox and chrome settings manager
			getStorage('theme', function (obj) {
				if (!chrome.runtime.error) {
					if (typeof obj.theme != "undefined"){
						toAdd = toAdd.replace('"' + obj.theme.name + '"', '"' + obj.theme.name + '" selected="selected"');
					} else {
						toAdd = toAdd.replace('"default"', '"default" selected="selected"');
					}
				}

				getStorage('homework', function (obj) {
					if (!chrome.runtime.error) {
						if(obj.homework){
							homework = true;
						} else {
							toAdd = toAdd.replace('"homeworkCheck" checked="checked"', '"homeworkCheck"');
							homework = false;
						}

						getStorage('sortTaskBy', function (obj) {
							if (!chrome.runtime.error) {
								if(typeof obj.sortTaskBy != "undefined"){
									toAdd = toAdd.replace('"' + obj.sortTaskBy +'"', '"' + obj.sortTaskBy + '" selected="selected"')
								}else{
									toAdd = toAdd.replace('"5"', '"5" selected="selected"')
								}

								getStorage('hideTask', function (obj) {
									if (!chrome.runtime.error) {
										if(obj.hideTask){
											hideTask = true;
										} else {
											toAdd = toAdd.replace('"hideTask" checked="checked"', '"hideTask"');
											hideTask = false;
										}
										pagecontent.html(toAdd);

										$('.active').removeClass("active");
										$('#id_settings').parent().addClass("active");


										$('#id_skema').click(function() {
											location.reload(true);
										});

									}
								});
							}
						});
					}
				});
			});

			pagecontent.off("change");

			pagecontent.on("change", "#theme", function() {
				setStorage({'theme' : themes[theme.value]});
				setStorage(themes[theme.value]);
				//attempt to send message to content script
				curtheme = themes[theme.value];
				runTheme();
				location.reload();
			});

			pagecontent.on("change", "#homework", function() {
				homework = !homework;
				setStorage({'homework' : homework});
			});

			pagecontent.on("change", "#sortTaskBy", function() {
				setStorage({'sortTaskBy' : $('#sortTaskBy').val()});
			});

			pagecontent.on("change", "#hideTask", function() {
				hideTask = !hideTask;
				setStorage({'hideTask' : hideTask});
			});



		}
	});



}

//The ++Settings menu button
var extraMenu = '<li><a ontouchend="javascript:uddata_activ_menu(\'id_settings\');" href="#" id="id_settings"><i class="icon-wrench"></i> <span class="menu-text" title="Settings">++ Settings</span></a></li>';

//Finds the left navbar and appends extraMenu
$('html body.hoverable div#wrapper div#wrapcontent div.main-container.container-fluid div#sidebar.sidebar ul.nav.nav-list').append(extraMenu);

$('#id_settings').click(activ_plus_menu);
