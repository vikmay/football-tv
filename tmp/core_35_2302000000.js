/* Copyright (c) 2015-2026 Livesport s.r.o.
 * You are not allowed to copy or redistribute this file.
 */

/**
 * Get existing league ID
 *
 * @param object
 * @param id
 * @returns Data_Item|null
 */
function getExistingLeagueId(object, id)
{
	var leagueItem;
	try
	{
		leagueItem = object.getItem(id);
	}
	catch(err) {
		leagueItem = null;
	}

	return leagueItem;
}

/** Set league display
*/
function expand_collapse_league_load()
{
	if (country == null)
	{
		var cookie_name = 'fsdc_expand_collapse_league';
		var tmp_cookie = clientStorage.get(cookie_name);

		// there are leagues in cookie
		if (tmp_cookie != null && tmp_cookie.length > 0)
		{
			// set custom flag for games
			cjs.dic.get('dataLeagueHolderProxy').getHandler().each(function(index, id)
			{
				if (tmp_cookie.match(id) == null)
				{
					return;
				}
				var leagueItem = getExistingLeagueId(this, id);
				if (!leagueItem)
				{
					return;
				}
				if (leagueItem.getValue('ZD') == 'c')
				{
					leagueItem.setValue('display', true);
				}
				else
				{
					leagueItem.setValue('display', false);
				}
			});
		}
	}
};

// global variables {{{
    // config variables
var cjs = {
        'classes': {},
        'noDuelSports': [23,31,32,33,34,35,37,38,39,40,41],
        'parentSports': {"32":31,"33":31,"38":37,"39":37,"40":37,"41":37},
        'childSportsCount': 38,
        'categorySports': [2,16,17,21,25,28,23,31,32,33,34,36,37,38,39,40,41],
        eventId: null,
        fromGlobalScope: {},
        'portable': {},
        initialFeeds: [],
        ...cjs,
        'constants': {
            'soundSportConfig': {"soccer":{"finished":"commonEndOfGame","correction":"commonCorrection","score-incremented":"commonCheers"},"tennis":{"finished":"tennisGameSetMatch","correction":"commonCorrection","score-incremented":"tennisGameSet","tennis-game":"tennisGame"},"basketball":{"finished":"commonEndOfGame","correction":"commonCorrection"},"hockey":{"finished":"commonEndOfGame","correction":"commonCorrection","score-incremented":"commonCheers"},"american-football":{"finished":"commonEndOfGame","correction":"commonCorrection","score-incremented":"commonCheers"},"baseball":{"finished":"commonEndOfGame","correction":"commonCorrection"},"handball":{"finished":"commonEndOfGame","correction":"commonCorrection"},"rugby-union":{"finished":"commonEndOfGame","correction":"commonCorrection","score-incremented":"commonCheers"},"floorball":{"finished":"commonEndOfGame","correction":"commonCorrection","score-incremented":"commonCheers"},"bandy":{"finished":"commonEndOfGame","correction":"commonCorrection","score-incremented":"commonCheers"},"futsal":{"finished":"commonEndOfGame","correction":"commonCorrection","score-incremented":"commonCheers"},"volleyball":{"correction":"commonCorrection","score-incremented":"commonCheers"},"aussie-rules":{"finished":"commonEndOfGame","correction":"commonCorrection"},"rugby-league":{"finished":"commonEndOfGame","correction":"commonCorrection","score-incremented":"commonCheers"},"cricket":{"finished":"commonEndOfGame","correction":"commonCorrection"},"darts":{"finished":"commonEndOfGame","correction":"commonCorrection"},"snooker":{"finished":"commonEndOfGame","correction":"commonCorrection"},"boxing":{"finished":"commonEndOfGame","correction":"commonCorrection"},"beach-volleyball":{"finished":"commonEndOfGame","correction":"commonCorrection"},"badminton":{"correction":"commonCorrection"},"water-polo":{"finished":"commonEndOfGame","correction":"commonCorrection"},"field-hockey":{"finished":"commonEndOfGame","correction":"commonCorrection"},"table-tennis":{"correction":"commonCorrection"},"beach-soccer":{"finished":"commonEndOfGame","correction":"commonCorrection"},"mma":{"finished":"commonEndOfGame","correction":"commonCorrection"},"netball":{"finished":"commonEndOfGame","correction":"commonCorrection"},"pesapallo":{"finished":"commonEndOfGame","correction":"commonCorrection"},"golf":{"finished":"commonEndOfGame"},"motorsport":[],"motorsport-auto-racing":[],"motorsport-moto-racing":[],"cycling":[],"horse-racing":[],"esports":{"finished":"commonEndOfGame","correction":"commonCorrection"},"winter-sports":[],"winter-sports-ski-jumping":[],"winter-sports-alpine-skiing":[],"winter-sports-cross-country":[],"winter-sports-biathlon":[],"kabaddi":{"finished":"commonEndOfGame","correction":"commonCorrection"}},
            'sportOddsTypeList': {"1":"1x2","2":"12","3":"12","4":"1x2","5":"12","6":"12","7":"1x2","8":"1x2","9":"1x2","10":"1x2","11":"1x2","12":"12","18":"12","19":"1x2","13":"12","14":"12","15":"12","16":"1x2","17":"12","21":"12","22":"1x2","24":"1x2","25":"12","26":"1x2","28":"12","29":"12","30":"1x2","23":"12","31":"12","32":"12","33":"12","34":"12","35":"12","36":"12","37":"12","38":"12","39":"12","40":"12","41":"12","42":"1x2"},
            ...(cjs && cjs.constants ? cjs.constants : {}),
        },
    };

    cjs.ready = new Promise(function (resolve) {
        if (cjs._dicReady) {
            resolve();
        } else {
            cjs._markReady = resolve;
        }
    });

            cjs.search = {
            'disabledSports': [32,33]        };

        document.lsadvert_display = document.lsadvert_display || function() {};
    document.displayTrustedAdvert = document.displayTrustedAdvert || function() {};
    cjs.full_loaded = false;
    cjs.repair_loaded = false;
    cjs.hourFormat = 'H:i';
    cjs.dateTimeFormat = 'd.m. H:i';
    cjs.fullDateTimeFormat = 'd.m.Y H:i';
    cjs.fullDateFormat = 'd.m.Y';
    cjs.fullDateShortFormat = 'd.m.Y';
    cjs.dateFormat = 'd.m.';
    cjs.geoIP = null;
    cjs.geoIPCityName = null;
    cjs.geoIPSubdivisionName0 = null;
    cjs.geoIPSubdivisionCode0 = null;
    cjs.geoIPIsoSubdivisionCode0 = null;
    cjs.geoIPSubdivisionName1 = null;
    cjs.prepareGeoIP = function()
    {
        if (this.geoIP)
        {
            return;
        }
        cjs.Api.loader.get("geoIpResolver").call();
    };
    var feed_sign = 'SW9D1eZo';
    // data containers
    var fs_counter;
    var fsEventsUpdatedStartTime = {};
cjs._config = {"js_serial":"2302000000","js":{"time_keep_match_live":180},"app":{"version":"8.30.0","icon_action_svg":"\/res\/_fs\/image\/13_symbols\/action.svg?serial=1751","lang":{"charset":"uk_UA","web":"ua","dc":41,"meta_content":"uk"},"lang_combo":{"enable":false,"project_list":false,"has_lang_from_subdomain":false},"noduel_events":{"mygames":10,"main":{"default":40,"golf":30,"motorsport-auto-racing":40,"motorsport-moto-racing":40,"cycling":10,"winter-sports-ski-jumping":10,"winter-sports-alpine-skiing":10,"winter-sports-cross-country":10,"winter-sports-biathlon":10},"tournament_page":{"winter-sports-ski-jumping":1000,"winter-sports-alpine-skiing":1000,"winter-sports-cross-country":1000,"winter-sports-biathlon":1000},"participant_page":{"meetings":{"winter-sports-ski-jumping":5,"winter-sports-alpine-skiing":5,"winter-sports-cross-country":5,"winter-sports-biathlon":5},"events":{"motorsport-auto-racing":10,"motorsport-moto-racing":10,"cycling":10}},"categories":{"6576":10,"7771":10}},"mygames":{"enable":true,"position":"left","groups":{"enable":false},"past_days":1,"future_days":7,"maximum_count":200},"calendar_range":7,"google_analytics":{"enable":true},"video_highlights_live_icon":{"enable":true},"US_time_format":false,"US_style_win_loss_mark":false,"project_type":{"id":5,"name":"_fs","us_web":false},"popup":false,"js_redirect":false,"myteams":{"enable":true,"maximum_count":200},"has_category_page":[2,21,23,31,32,33,36],"banner":{"zone_list":{"background":{"name":"background","definitions":[{"zoneId":2027,"size":{"width":1920,"height":1200},"breakpoint":{"min":1048,"max":9999}}],"renderer":"wallpaper"},"left_menu_1":{"name":"left_menu_1","definitions":[{"zoneId":2028,"size":{"width":140,"height":240},"breakpoint":{"min":640,"max":9999}}]},"left_menu_2":{"name":"left_menu_2","definitions":[{"zoneId":2034,"size":{"width":140,"height":240},"breakpoint":{"min":640,"max":9999}}],"rendererOptions":{"displaySkeleton":false}},"left_menu_3":{"name":"left_menu_3","definitions":[{"zoneId":3846,"size":{"width":140,"height":240},"breakpoint":{"min":640,"max":9999}}],"rendererOptions":{"displaySkeleton":false}},"right_top":{"name":"right_top","definitions":[{"zoneId":6538,"size":{"width":300,"height":600},"breakpoint":{"min":1048,"max":9999}}],"rendererOptions":{"displaySkeleton":false}},"right_zone_1":{"name":"right_zone_1","definitions":[{"zoneId":6539,"size":{"width":300,"height":600},"breakpoint":{"min":1048,"max":9999}}],"rendererOptions":{"displaySkeleton":false}},"right_zone_2":{"name":"right_zone_2","definitions":[{"zoneId":6540,"size":{"width":300,"height":600},"breakpoint":{"min":1048,"max":9999}}],"rendererOptions":{"displaySkeleton":false}},"top":{"name":"top","definitions":[{"zoneId":2041,"size":{"width":970,"height":90},"breakpoint":{"min":1048,"max":9999}}],"rendererOptions":{"labelPosition":"Right","displayPlaceholder":true}},"content_bottom":{"name":"content_bottom","definitions":[{"zoneId":2042,"size":{"width":480,"height":480},"breakpoint":{"min":1,"max":9999}}],"rendererOptions":{"displaySkeleton":false}},"detail_top":{"name":"detail_top","definitions":[{"zoneId":5055,"size":{"width":970,"height":90},"breakpoint":{"min":1048,"max":9999}}],"rendererOptions":{"labelPosition":"Right","displayPlaceholder":true}},"detail_content":{"name":"detail_content","definitions":[{"zoneId":2043,"size":{"width":480,"height":480},"breakpoint":{"min":1,"max":9999}}],"rendererOptions":{"displaySkeleton":false}},"detail_background":{"name":"detail_background","definitions":[{"zoneId":16381,"size":{"width":3000,"height":2000},"breakpoint":{"min":1048,"max":9999}}],"renderer":"wallpaper"},"detail_left_menu_1":{"name":"detail_left_menu_1","definitions":[{"zoneId":16385,"size":{"width":140,"height":240},"breakpoint":{"min":640,"max":9999}}]},"detail_left_menu_2":{"name":"detail_left_menu_2","definitions":[{"zoneId":16387,"size":{"width":140,"height":240},"breakpoint":{"min":640,"max":9999}}],"rendererOptions":{"displaySkeleton":false}},"detail_left_menu_3":{"name":"detail_left_menu_3","definitions":[{"zoneId":16389,"size":{"width":140,"height":240},"breakpoint":{"min":640,"max":9999}}],"rendererOptions":{"displaySkeleton":false}},"detail_right_top":{"name":"detail_right_top","definitions":[{"zoneId":16391,"size":{"width":300,"height":600},"breakpoint":{"min":1048,"max":9999}}],"rendererOptions":{"displaySkeleton":false}},"detail_right_zone_1":{"name":"detail_right_zone_1","definitions":[{"zoneId":16393,"size":{"width":300,"height":600},"breakpoint":{"min":1048,"max":9999}}],"rendererOptions":{"displaySkeleton":false}},"detail_right_zone_2":{"name":"detail_right_zone_2","definitions":[{"zoneId":16395,"size":{"width":300,"height":600},"breakpoint":{"min":1048,"max":9999}}],"rendererOptions":{"displaySkeleton":false}},"detail_right_zone_3":{"name":"detail_right_zone_3","definitions":[{"zoneId":16397,"size":{"width":300,"height":600},"breakpoint":{"min":1048,"max":9999}}],"rendererOptions":{"displaySkeleton":false}},"detail_right_zone_4":{"name":"detail_right_zone_4","definitions":[{"zoneId":16399,"size":{"width":300,"height":600},"breakpoint":{"min":1048,"max":9999}}],"rendererOptions":{"displaySkeleton":false}},"detail_box_over_content":{"name":"detail_box_over_content","definitions":[{"zoneId":16383,"size":{"width":688,"height":85},"breakpoint":{"min":728,"max":9999},"rendererOptions":{"sticky":true}},{"zoneId":16401,"size":{"width":320,"height":100},"breakpoint":{"min":320,"max":727}}]},"responsive_standings_fixed_bottom":{"name":"responsive_standings_fixed_bottom","definitions":[{"zoneId":3546,"size":{"width":320,"height":50},"breakpoint":{"min":320,"max":727},"refreshInterval":45},{"zoneId":3547,"size":{"width":728,"height":90},"breakpoint":{"min":728,"max":999},"refreshInterval":45}]},"responsive_fixed_bottom":{"name":"responsive_fixed_bottom","definitions":[{"zoneId":3544,"size":{"width":320,"height":50},"breakpoint":{"min":320,"max":727},"refreshInterval":45},{"zoneId":3545,"size":{"width":728,"height":90},"breakpoint":{"min":728,"max":999},"refreshInterval":45}]},"responsive_detail_fixed_bottom":{"name":"responsive_detail_fixed_bottom","definitions":[{"zoneId":3546,"size":{"width":320,"height":50},"breakpoint":{"min":320,"max":727},"refreshInterval":45,"allowedClientTypes":["mobile","tablet"]},{"zoneId":3547,"size":{"width":728,"height":90},"breakpoint":{"min":728,"max":9999},"refreshInterval":45,"allowedClientTypes":["mobile","tablet"]}]},"premium_square_mobile":{"name":"premium_square_mobile","definitions":[{"zoneId":6139,"size":{"width":480,"height":480},"breakpoint":{"min":300,"max":639}}],"renderer":"dynamic"},"box_over_content":{"name":"box_over_content","definitions":[{"zoneId":9513,"size":{"width":688,"height":85},"breakpoint":{"min":728,"max":9999}},{"zoneId":9515,"size":{"width":320,"height":100},"breakpoint":{"min":320,"max":727}}],"rendererOptions":{"sticky":true}}},"show_advertisement_label":false,"advertisement_label":{"odds_forced_by_geo_ip":[]}},"project":{"id":35,"name":"Flashscore.ua","default_geo_ip_country_code":"UA","default_geo_ip_subdivision_code":false},"odds":{"layout":"default","us_layout_excluded_sports":[],"format":"eu","format_list":["eu"],"format_promo_enabled":true,"ah_override":false,"us_handicap":false,"enable":true,"iframe":true,"my_fs":false,"sport_page":false,"hide_tab":false,"odds_disabled_countries":[],"betslip":false,"betslip_detail_window":false,"betslip_window_size":[],"bookmakers_sp_allowed":[16],"light_live_bet_icon":false,"hide_live_bet_icon":false,"odds_comparison_show_copyright":true,"probability_to_win":false,"odds_powered_by_geo_ip":[],"odds_powered_by_geo_ip_subdivision":[],"odds_powered_by_enabled_for_summary":false,"prematch_button":{"disabled_geoIps":["GR","IT"]}},"watch":{"enable":false},"livetable_calendar":{"full_width":false},"redirector":{"types":{"event":1,"tournament_template":2,"participant":3,"player":4,"detail_page":5}},"fs_stats":{"enable":true,"url":{"mygames":"remote-stats.flashscore.com\/mg","adblocked":"","search_stats":"remote-stats.flashscore.com\/ss"}},"empty_logo_small_path":{"logo_team":"image\/empty-logo-team-small.png"},"game_notification_push":{"enable":true},"user_functions":{"server_domain":"lsid.eu","serverAPI":"https:\/\/user-internal-service.intra.livesport.services\/","api_key":"j5fk8N0nJ7aBJxBOTfKcAWVKPDfexqkj","enable":true,"use_only_local":true,"namespace":"flashscore","facebook_app_id":"867312743387243","google_client_id":"743879696125-1n5lcubivtamnpuqbofhvel2c9q864f9.apps.googleusercontent.com","apple_client_id":"com.flashscore.siwa","apple_redirect_uri":"https:\/\/user-login-proxy-service.livesport.services\/api\/v1\/proxy\/apple\/","email_login_enabled":true,"server":"https:\/\/lsid.eu\/"},"user_function":{"use_only_local":false},"registration":{"version":1,"sign_out_in_drop_down":true,"project_has_initial_tou":true,"no_remote":false},"captcha_sitekey":"6LdnlAoTAAAAAIzaLLR8ezPKKnLeM2LozP6OQKj_","european_union_states":{"codes":["BE","BG","CZ","DK","EE","FI","FR","HR","IE","IT","CY","LT","LV","LU","HU","MT","DE","NL","PL","PT","AT","RO","GR","SK","SI","GB","ES","SE"]},"url_prefix":"","project_moved":[],"sports_without_detail":[35],"tournament_pages":{"enable":true,"disabled_sports":[],"block_summary_match_limit":10,"data_part_match_limit":100},"new_mobile_page":{"enable":true},"box_over_content":{"split":{"columns":3}},"detail_live_betting_strip":{"rotation_time":30000},"sports_with_participant_no_duel_page":[38,39,40,41,32,33,34],"match_comments":{"enable":true},"new_live_betting_icon":{"enable":true,"version":1},"live_streaming":{"disabled_bookmakers_by_geoip":[],"bookmakers_with_disabled_link":[]},"facelift":{"main_class":"flat"},"icon_list":{"info":true,"shirt":true,"tv":true},"react":{"enabled":false,"sports":false},"responsive":{"breakpoint":800,"breakpoint_mobile":640},"tv_program":{"enable":true},"mixed_feed":{"link_to_more_games":false,"homepage_enabled":false},"team_transfers":{"sports":[1,4]},"team_news":{"enabled":true},"feed_sign":"SW9D1eZo","detail":{"window_size":{"width":688,"height":900}},"audio_comments":{"enabled":false,"tabEnabled":false,"format":"HLS"},"tv":false,"apple_sign_in":{"enable":true},"advanced_tennis":{"enable":true,"point_by_point":true},"reversed_time":{"enable":false,"sports":{"3":{"stages":[22,23,24,25],"extra_time_stages":[6],"stage_time":10,"extra_time":5},"4":{"stages":[14,15,16],"extra_time_stages":[6],"stage_time":20,"extra_time":5},"5":{"stages":[22,23,24,25],"extra_time_stages":[6],"stage_time":15,"extra_time":15}}},"player_profile":{"enabled_sports":[1,4,3]},"empty_logo_path":{"face_man":"image\/empty-face-man-share.gif","face_woman":"image\/empty-face-woman-share.gif","logo_team":"image\/empty-logo-team-share.gif"},"team_logo":{"enable":true,"detail":true,"standings":false,"h2h":true,"iframe":true},"lang_box":{"enabled":true,"redirects":{"US":{"title":"Follow our live scores in English!","description":"Go to <a href=\"https:\/\/www.flashscoreusa.com\/\">FlashscoreUSA.com<\/a>","lang_combo":{"--":130},"lang_dialog_translations":{"title":"Enjoy your favorite live scores service even more on the brand new Flashscore USA website!","button":"Confirm and go","stay_button":"I want to stay on Flashscore.com"}},"AU":{"title":"Follow our live scores on our Aussie website!","description":"Go to <a href=\"https:\/\/www.flashscore.com.au\/\">Flashscore.com.au<\/a>"},"UK":{"title":"Follow our live scores on our UK website!","description":"Go to <a href=\"https:\/\/www.flashscore.co.uk\/\">Flashscore.co.uk<\/a>"},"CA":{"title":"Follow our live scores on our Canadian website!","description":"Go to <a href=\"https:\/\/www.flashscore.ca\/\">Flashscore.ca<\/a>"},"DK":{"title":"Følg vores live resultater på dansk.","description":"Gå til <a href=\"https:\/\/www.flashscore.dk\/\">Flashscore.dk<\/a>"},"BG":{"title":"Следвай нашите резултати на български!","description":"Отиди на <a href=\"https:\/\/www.flashscore.bg\/\">Flashscore.bg<\/a>"},"BR":{"title":"Acompanhe nossos resultados ao vivo em português!","description":"Siga para <a href=\"https:\/\/www.flashscore.com.br\/\">Flashscore.com.br<\/a>","lang_combo":{"--":401},"lang_dialog_translations":{"title":"Lançamos um Flashscore Brasil totalmente novo e localizado para você!","redirect":"Clique no botão para confirmar que você deseja acessá-lo.","button":"Confirmar e avançar","stay_button":"Quero continuar no Flashscore.com"}},"DE":{"title":"Verfolge unsere Livescores auf deutsch!","description":"Hier geht es zu <a href=\"https:\/\/www.flashscore.de\/\">Flashscore.de<\/a>"},"AT":{"title":"Folge unseren Live-Ergebnissen auf Deutsch!","description":"Gehe auf <a href=\"https:\/\/www.flashscore.at\/\">Flashscore.at<\/a>"},"CH":{"parent":"DE"},"GR":{"title":"Παρακολουθήστε τα ζωντανά μας αποτελέσματα στα ελληνικά!","description":"Μεταβείτε στο <a href=\"https:\/\/www.flashscore.gr\/\">Flashscore.gr<\/a>"},"ES-CT":{"parent":"ES"},"ES":{"title":"¡Sigue nuestros marcadores en directo en español!","description":"Accede a <a href=\"https:\/\/www.flashscore.es\/\">Flashscore.es<\/a>"},"BO":{"parent":"ES"},"GF":{"parent":"ES"},"GY":{"parent":"ES"},"PY":{"parent":"ES"},"SR":{"title":"Pratite naše rezultate uživo na srpskom!","description":"Idite na <a href=\"https:\/\/www.livescore.in\/rs\">LiveScore.in\/rs<\/a>"},"UY":{"parent":"ES"},"PA":{"parent":"ES"},"JM":{"parent":"ES"},"GT":{"parent":"ES"},"NI":{"parent":"ES"},"CU":{"parent":"ES"},"PH":{"title":"Sundan ng live ang mga iskor sa Tagalog!","description":"Pumunta sa <a href=\"https:\/\/www.flashscore.ph\/\">Flashscore.ph<\/a>"},"CL":{"title":"¡Sigue nuestros marcadores en vivo en español!","description":"Ingresa a <a href=\"https:\/\/www.flashscore.cl\/\">Flashscore.cl<\/a>"},"CO":{"title":"¡Sigue nuestros marcadores en vivo y en Español!","description":"Ingresa a <a href=\"https:\/\/www.flashscore.co\/\">Flashscore.co<\/a>"},"AR":{"title":"¡Seguí nuestros resultados en vivo en español!","description":"Visitá <a href=\"https:\/\/www.flashscore.com.ar\/\">Flashscore.com.ar<\/a>"},"MX":{"title":"¡Sigue los resultados en vivo en Español!","description":"Ve a <a href=\"https:\/\/www.flashscore.com.mx\/\">Flashscore.com.mx<\/a>"},"VE":{"title":"¡Sigue nuestros marcadores en vivo en Español!","description":"Ve a <a href=\"https:\/\/www.flashscore.com.ve\/\">Flashscore.com.ve<\/a>"},"PE":{"title":"¡Sigue nuestros resultados en vivo en español!","description":"Ve a <a href=\"https:\/\/www.flashscore.pe\/\">Flashscore.pe<\/a>"},"FI":{"title":"Seuraa tuloksiamme livenä suomeksi!","description":"Siirry <a href=\"https:\/\/www.flashscore.fi\/\">Flashscore.fi<\/a>-sivuille!"},"FR":{"title":"Suivez nos scores en direct en français!","description":"Rendez-vous sur <a href=\"https:\/\/www.flashscore.fr\/\">Flashscore.fr<\/a>","lang_combo":{"--":16},"lang_dialog_translations":{"title":"Nous avons lancé un nouveau site web local pour vous, Flashscore France !","redirect":"Cliquez sur le bouton suivant pour confirmer que vous souhaitez accéder au site local.","button":"Confirmez et allez-y","stay_button":"Je veux rester sur Flashscore.com"}},"GE":{"title":"ცოცხალი ანგარიშები ქართულად!","description":"<a href=\"https:\/\/www.flashscore.ge\/\">Flashscore.ge<\/a>"},"MY":{"title":"Ikuti skor langsung kami dalam Bahasa Melayu!","description":"Pergi ke <a href=\"https:\/\/www.flashscore.com.my\/\">Flashscore.com.my<\/a>"},"HR":{"title":"Pratite naše rezultate uživo na hrvatskom!","description":"Idite na <a href=\"https:\/\/www.rezultati.com\/\">Rezultati.com<\/a>"},"LT":{"title":"Sekite rezultatus lietuviškai!","description":"Eikite į <a href=\"https:\/\/www.flashscore.in\/\">Flashscore.in<\/a>"},"HU":{"title":"Kövesd az élő eredményeket magyar nyelven!","description":"Az <a href=\"https:\/\/www.eredmenyek.com\/\">Eredmenyek.com<\/a> megnyitása"},"KO":{"title":"한국어로 실시간 스코어를 확인하세요!","description":"<a href=\"https:\/\/www.flashscore.co.kr\/\">Flashscore.co.kr<\/a>로 이동"},"IN":{"title":"Follow our live scores on our Indian websites!","description":"Go to <a href=\"https:\/\/www.flashscore.in\/\">Flashscore.in<\/a>","lang_combo":{"--":26,"hi":261,"bn":262,"te":265,"ta":263,"kn":264},"lang_dialog_translations":{"title":"We just launched a brand new, fully localised Flashscore India for you!","local_project_title":"New languages available!","perex":"Pick your language and give it try!","button":"Confirm and go","local_project_button":"Confirm","stay_button":"I want to stay on Flashscore.com"}},"IT":{"title":"Segui i nostri risultati in italiano!","description":"Vai su <a href=\"https:\/\/www.flashscore.it\/\">Flashscore.it<\/a>"},"ID":{"title":"Ikutilah Skor langsung kami dalam Bahasa Indonesia!","description":"Kunjungilah <a href=\"https:\/\/www.flashscore.co.id\/\">Flashscore.co.id<\/a>"},"JP":{"title":"ぜひ、私どもの日本版ライブスコアをフォローください！","description":"<a href=\"https:\/\/www.flashscore.co.jp\/\">Flashscore.co.jp<\/a> はこちら"},"KZ":{"title":"Live нәтижелерді Қазақ тілінде бақылаңыз!","description":"<a href=\"https:\/\/www.flashscorekz.com\/\">FlashscoreKZ.com<\/a> желісіне өту"},"NL":{"title":"Volg onze live uitslagen in het Nederlands!","description":"Ga naar <a href=\"https:\/\/www.flashscore.nl\/\">Flashscore.nl<\/a>"},"PL":{"title":"Śledź nasze wyniki na żywo po polsku!","description":"Przejdź na <a href=\"https:\/\/www.flashscore.pl\/\">Flashscore.pl<\/a>","lang_combo":{"--":3},"lang_dialog_translations":{"title":"Właśnie uruchomiliśmy dla Ciebie nowy, lokalny Flashscore Polska","redirect":"Kliknij poniższy przycisk, aby potwierdzić, że chcesz uzyskać dostęp do lokalnej witryny.","button":"Potwierdź i przejdź","stay_button":"Chcę pozostać na Flashscore.com"}},"PT":{"title":"Segue os resultados ao vivo em Português!","description":"Visita <a href=\"https:\/\/www.flashscore.pt\/\">Flashscore.pt<\/a>"},"PT-BR":{"title":"Acompanhe nossos resultados ao vivo em português!","description":"Siga para <a href=\"https:\/\/www.flashscore.com.br\/\">Flashscore.com.br<\/a>"},"RO":{"title":"Urmărește scoruri live în Română!","description":"Du-te pe <a href=\"https:\/\/www.flashscore.ro\/\">Flashscore.ro<\/a>"},"SK":{"title":"Sledujte naše live výsledky v slovenčine!","description":"Prejsť na <a href=\"https:\/\/www.flashscore.sk\/\">Flashscore.sk<\/a>"},"SI":{"title":"Spremljajte rezultate v živo v Slovenščini!","description":"Obiščite <a href=\"https:\/\/www.flashscore.si\/\">Flashscore.si<\/a>"},"SE":{"title":"Följ vår livescore på svenska!","description":"Gå till <a href=\"https:\/\/www.flashscore.se\/\">Flashscore.se<\/a>"},"VN":{"title":"Theo dõi tỷ số trực tiếp bằng Tiếng Việt!","description":"Hãy đến <a href=\"https:\/\/www.flashscore.vn\/\">Flashscore.vn<\/a>"},"UA":{"title":"Стежте за нашими live результатами українською!","description":"Перейти на <a href=\"https:\/\/www.flashscore.ua\/\">Flashscore.ua<\/a>"},"VI":{"title":"Để xem trực tiếp tỉ số bằng tiếng Việt!","description":"Hãy dùng <a href=\"https:\/\/www.flashscore.vn\/\">Flashscore.vn<\/a>"},"TR":{"title":"Canlı skorları Türkçe takip edin!","description":"<a href=\"https:\/\/www.flashscore.com.tr\/\">Flashscore.com.tr<\/a>'ye gidin"},"CZ":{"title":"Sledujte naše live výsledky v češtině!","description":"Přejít na <a href=\"https:\/\/www.livesport.cz\/\">Livesport.cz<\/a>"},"JA":{"title":"私どもの日本版ライブスコアをフォローください！","description":"<a href=\"https:\/\/www.flashscore.co.jp\/\">Flashscore.co.jp<\/a> はこちら。"},"KR":{"title":"한국어로 실시간 스코어를 확인하세요!","description":"<a href=\"https:\/\/www.flashscore.co.kr\/\">Flashscore.co.kr<\/a> 바로가기"}},"show_after_visits":3},"confirmation_box":{"enabled":false},"myfs":{"enabled":true,"newsfeed":{"past_days":14,"count":15,"allowed_counts":[3,15,30]},"refresh_tolerance":4},"swap_participants":{"sports":[],"show_at_sign":false},"legal_age_confirmation":{"enabled":false,"geoip":[],"show_age_question":true,"can_rewoke_age_confirm":false,"hide_odds_before_confirm":false,"storage_ttl":7776000,"overlay_modal_geoip":[],"gambling_opt_out":false},"gambling":{"gamble_responsibly_footer":{"project_geoip":"","client_geoips":[],"hide_bottom":false,"notices_for_subdivisions":{"USIA":"TRANS_GAMBLE_RESPONSIBLY_FOOTER_IOWA_TEXT","USIL":"TRANS_GAMBLE_RESPONSIBLY_FOOTER_ILLINOIS_TEXT","USMO":"TRANS_GAMBLE_RESPONSIBLY_FOOTER_MISSOURI_TEXT"}},"legal_banner":{"client_geoips":["UA"]}},"last_matches_stats_order":{"3":[595,169,713,541,696,697],"4":[596,541,169,777,715,649,781],"1":[595,596,541,649,965,599,600]},"disabled_pages":{"geoip":["TR","GR"]},"disabled_betting_in_live":{"geoip":[""]},"dark_mode":{"enabled":true,"theme_switcher":true,"dark_is_default":false},"sports_with_flag":[2,14,16,28,25,15,17,21,23],"onetrust":{"show_privacy_shield":false,"enable":true},"myleagues":{"position_of_banner":10},"team_page":{"duel":[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,21,22,24,25,26,28,29,30,23,33,36,42],"outright_odds":{"enabled":true,"summary_tab":{"enabled":true},"allowed_sports":[1,3,4]}},"fsds":{"client_urls":{"default":"https:\/\/35.ds.lsapp.eu\/pq_graphql","live_odds":"https:\/\/35.ds.lsapp.eu\/pq_graphql","odds":"https:\/\/global.ds.lsapp.eu\/odds\/pq_graphql"},"pushPrefix":"\/fsds\/changes"},"fs_news":{"enabled":false,"widgets":{"live_table":{"enabled":false},"detail":{"enabled":false,"blacklisted_sport_id":[]},"tournament_page_summary_tab":{"enabled":false}},"video_api":{"host":"https:\/\/media.lsmedialib.com"},"source":false,"images":{"cloud":{"endpoint":"https:\/\/livesport-ott-images.ssl.cdn.cra.cz"}},"show_logo_and_source":true},"line_up":{"used_substitutes":{"enabled":true,"sports":[1]},"sports_with_participant_images":[1,3,4],"player_ratings":[1,4],"live_player_ratings":false,"sports_with_live_rating":[1],"fsds_source":[1,3,4],"predicted_line_up":true},"promo_bar":{"multi_language_bar":{"enabled":false,"new_languages":[],"hide_for_geo_ip":[]}},"frontend_logging":{"enable":true,"server":"https:\/\/logging-service.livesport.services\/","token":"Y3uhIv5Ges46mMdAZm53akso95sYOogk","percentage_of_sessions_to_log":1},"static_fs_cdn":{"enabled":true,"url":"https:\/\/static.flashscore.com"},"feed_resolver":{"local":[{"url":"https:\/\/35.flashscore.ninja","weight":1,"countries":["AL","AD","AM","AT","AZ","BY","BE","BA","BG","HR","CY","CZ","DK","EE","FO","FI","FR","GI","GR","HU","IS","IE","IL","IT","KZ","XK","LV","LI","LT","LU","MK","MD","MC","ME","NL","NO","PL","RO","RU","SM","RS","SK","SI","ES","SE","CH","TR","UA","GB"]}],"global":[],"default_url":"https:\/\/global.flashscore.ninja"},"sport_list":{"soccer":1,"tennis":2,"basketball":3,"hockey":4,"american-football":5,"baseball":6,"handball":7,"rugby-union":8,"floorball":9,"bandy":10,"futsal":11,"volleyball":12,"cricket":13,"darts":14,"snooker":15,"boxing":16,"beach-volleyball":17,"aussie-rules":18,"rugby-league":19,"badminton":21,"water-polo":22,"golf":23,"field-hockey":24,"table-tennis":25,"beach-soccer":26,"mma":28,"netball":29,"pesapallo":30,"motorsport":31,"motorsport-auto-racing":32,"motorsport-moto-racing":33,"cycling":34,"horse-racing":35,"esports":36,"winter-sports":37,"winter-sports-ski-jumping":38,"winter-sports-alpine-skiing":39,"winter-sports-cross-country":40,"winter-sports-biathlon":41,"kabaddi":42},"lang_box_dialog":{"enabled":false,"enabled_on_local":false,"hidden_flags_for_geo_ip":[],"langs_with_new_badge":[]},"full_page_match_detail":{"popup_button_tooltip_enabled":true,"popup_button_enabled":true,"open_detail_in_popup":false,"sticky_elements":{"match_header":{"is_sticky":true,"is_responsive_sticky":true}},"title_three_char_name":{"disabled_sports":[13,23]},"indexed_tabs":["summary","lineups","statistics","player-statistics","player-match-statistics","odds"],"live_streaming":{"button_enabled":false}},"single_sport":{"enabled":false},"live_table":{"standings_link_without_popup":false},"event_previews":{"enabled":true,"target_blank":true},"match_detail":{"top_statistics":{"enable":true}},"betting_types":{"1":{"prematch_odds":{"summary_tab":["HOME_DRAW_AWAY","OVER_UNDER","ASIAN_HANDICAP","BOTH_TEAMS_TO_SCORE"],"odds_tab":["HOME_DRAW_AWAY","OVER_UNDER","ASIAN_HANDICAP","BOTH_TEAMS_TO_SCORE","TO_QUALIFY","DOUBLE_CHANCE","EUROPEAN_HANDICAP","DRAW_NO_BET","CORRECT_SCORE","HALF_FULL_TIME","ODD_OR_EVEN"]},"live_odds":{"summary_tab":["HOME_DRAW_AWAY","NEXT_GOAL","OVER_UNDER","ASIAN_HANDICAP"],"odds_tab":["HOME_DRAW_AWAY","NEXT_GOAL","OVER_UNDER","ASIAN_HANDICAP","BOTH_TEAMS_TO_SCORE","TO_QUALIFY","DOUBLE_CHANCE","EUROPEAN_HANDICAP","DRAW_NO_BET","CORRECT_SCORE","HALF_FULL_TIME","ODD_OR_EVEN"]},"default_bet_type":"HOME_DRAW_AWAY"},"23":{"prematch_odds":{"summary_tab":["TOP_POSITION_MERGED"],"odds_tab":["HOME_DRAW_AWAY","HOME_AWAY","OVER_UNDER","ASIAN_HANDICAP","BOTH_TEAMS_TO_SCORE","TO_QUALIFY","DOUBLE_CHANCE","EUROPEAN_HANDICAP","DRAW_NO_BET","CORRECT_SCORE","HALF_FULL_TIME","ODD_OR_EVEN"]},"live_odds":{"summary_tab":[],"odds_tab":[]},"default_bet_type":"TOP_POSITION_MERGED","duel_default_bet_type":"HOME_AWAY"},"2":{"prematch_odds":{"summary_tab":["HOME_AWAY","OVER_UNDER","ASIAN_HANDICAP"],"odds_tab":["HOME_AWAY","OVER_UNDER","ASIAN_HANDICAP","CORRECT_SCORE","ODD_OR_EVEN"]},"live_odds":{"summary_tab":["HOME_AWAY","OVER_UNDER","ASIAN_HANDICAP"],"odds_tab":[]},"default_bet_type":"HOME_AWAY"},"4":{"prematch_odds":{"summary_tab":["HOME_DRAW_AWAY","HOME_AWAY","OVER_UNDER","ASIAN_HANDICAP"],"odds_tab":["HOME_DRAW_AWAY","HOME_AWAY","OVER_UNDER","ASIAN_HANDICAP","BOTH_TEAMS_TO_SCORE","TO_QUALIFY","DOUBLE_CHANCE","EUROPEAN_HANDICAP","DRAW_NO_BET","CORRECT_SCORE","ODD_OR_EVEN"]},"live_odds":{"summary_tab":["HOME_DRAW_AWAY","HOME_AWAY","OVER_UNDER","ASIAN_HANDICAP"],"odds_tab":[]},"default_bet_type":"HOME_DRAW_AWAY"},"3":{"prematch_odds":{"summary_tab":["HOME_AWAY","HOME_DRAW_AWAY","OVER_UNDER","ASIAN_HANDICAP"],"odds_tab":["HOME_AWAY","HOME_DRAW_AWAY","OVER_UNDER","ASIAN_HANDICAP","TO_QUALIFY","DOUBLE_CHANCE","EUROPEAN_HANDICAP","DRAW_NO_BET","HALF_FULL_TIME","ODD_OR_EVEN"]},"live_odds":{"summary_tab":["HOME_DRAW_AWAY","HOME_AWAY","OVER_UNDER","ASIAN_HANDICAP"],"odds_tab":[]},"default_bet_type":"HOME_AWAY"},"6":{"prematch_odds":{"summary_tab":["HOME_AWAY","OVER_UNDER","ASIAN_HANDICAP","HOME_DRAW_AWAY"],"odds_tab":["HOME_AWAY","OVER_UNDER","ASIAN_HANDICAP","CORRECT_SCORE","HOME_DRAW_AWAY","DOUBLE_CHANCE","EUROPEAN_HANDICAP","ODD_OR_EVEN"]},"live_odds":{"summary_tab":["HOME_AWAY","OVER_UNDER","ASIAN_HANDICAP","HOME_DRAW_AWAY"],"odds_tab":[]},"default_bet_type":"HOME_AWAY"},"14":{"prematch_odds":{"summary_tab":["HOME_AWAY","OVER_UNDER","ASIAN_HANDICAP","CORRECT_SCORE"],"odds_tab":["HOME_AWAY","OVER_UNDER","ASIAN_HANDICAP","EUROPEAN_HANDICAP","CORRECT_SCORE"]},"live_odds":{"summary_tab":["HOME_AWAY","OVER_UNDER","ASIAN_HANDICAP"],"odds_tab":[]},"default_bet_type":"HOME_AWAY"},"15":{"prematch_odds":{"summary_tab":["HOME_AWAY","ASIAN_HANDICAP"],"odds_tab":["HOME_DRAW_AWAY","HOME_AWAY","OVER_UNDER","ASIAN_HANDICAP","BOTH_TEAMS_TO_SCORE","TO_QUALIFY","DOUBLE_CHANCE","EUROPEAN_HANDICAP","DRAW_NO_BET","CORRECT_SCORE","HALF_FULL_TIME","ODD_OR_EVEN"]},"live_odds":{"summary_tab":["HOME_AWAY","ASIAN_HANDICAP"],"odds_tab":[]},"default_bet_type":"HOME_AWAY"},"12":{"prematch_odds":{"summary_tab":["HOME_AWAY","OVER_UNDER","ASIAN_HANDICAP"],"odds_tab":["HOME_DRAW_AWAY","HOME_AWAY","OVER_UNDER","ASIAN_HANDICAP","BOTH_TEAMS_TO_SCORE","TO_QUALIFY","DOUBLE_CHANCE","EUROPEAN_HANDICAP","DRAW_NO_BET","CORRECT_SCORE","HALF_FULL_TIME","ODD_OR_EVEN"]},"live_odds":{"summary_tab":["HOME_AWAY","OVER_UNDER","ASIAN_HANDICAP"],"odds_tab":[]},"default_bet_type":"HOME_AWAY"},"5":{"prematch_odds":{"summary_tab":["HOME_DRAW_AWAY","HOME_AWAY","OVER_UNDER","ASIAN_HANDICAP"],"odds_tab":["HOME_DRAW_AWAY","HOME_AWAY","OVER_UNDER","ASIAN_HANDICAP","BOTH_TEAMS_TO_SCORE","TO_QUALIFY","DOUBLE_CHANCE","EUROPEAN_HANDICAP","DRAW_NO_BET","CORRECT_SCORE","HALF_FULL_TIME","ODD_OR_EVEN"]},"live_odds":{"summary_tab":["HOME_DRAW_AWAY","HOME_AWAY","OVER_UNDER","ASIAN_HANDICAP"],"odds_tab":[]},"default_bet_type":"HOME_AWAY"},"18":{"prematch_odds":{"summary_tab":["HOME_AWAY","HOME_DRAW_AWAY","OVER_UNDER","ASIAN_HANDICAP"],"odds_tab":["HOME_AWAY","HOME_DRAW_AWAY","OVER_UNDER","ASIAN_HANDICAP","EUROPEAN_HANDICAP","HALF_FULL_TIME","ODD_OR_EVEN"]},"live_odds":{"summary_tab":["HOME_DRAW_AWAY","HOME_AWAY","OVER_UNDER","ASIAN_HANDICAP"],"odds_tab":[]},"default_bet_type":"HOME_AWAY"},"21":{"prematch_odds":{"summary_tab":["HOME_AWAY"],"odds_tab":["HOME_DRAW_AWAY","HOME_AWAY","OVER_UNDER","ASIAN_HANDICAP","BOTH_TEAMS_TO_SCORE","TO_QUALIFY","DOUBLE_CHANCE","EUROPEAN_HANDICAP","DRAW_NO_BET","CORRECT_SCORE","HALF_FULL_TIME","ODD_OR_EVEN"]},"live_odds":{"summary_tab":["HOME_AWAY"],"odds_tab":[]},"default_bet_type":"HOME_AWAY"},"10":{"prematch_odds":{"summary_tab":["HOME_DRAW_AWAY","OVER_UNDER","ASIAN_HANDICAP","DOUBLE_CHANCE"],"odds_tab":["HOME_DRAW_AWAY","HOME_AWAY","OVER_UNDER","ASIAN_HANDICAP","BOTH_TEAMS_TO_SCORE","TO_QUALIFY","DOUBLE_CHANCE","EUROPEAN_HANDICAP","DRAW_NO_BET","CORRECT_SCORE","HALF_FULL_TIME","ODD_OR_EVEN"]},"live_odds":{"summary_tab":["HOME_DRAW_AWAY","OVER_UNDER","ASIAN_HANDICAP"],"odds_tab":[]},"default_bet_type":"HOME_DRAW_AWAY"},"26":{"prematch_odds":{"summary_tab":["HOME_DRAW_AWAY","HOME_AWAY","OVER_UNDER","ASIAN_HANDICAP"],"odds_tab":["HOME_DRAW_AWAY","HOME_AWAY","OVER_UNDER","ASIAN_HANDICAP","BOTH_TEAMS_TO_SCORE","TO_QUALIFY","DOUBLE_CHANCE","EUROPEAN_HANDICAP","DRAW_NO_BET","CORRECT_SCORE","HALF_FULL_TIME","ODD_OR_EVEN"]},"live_odds":{"summary_tab":["HOME_DRAW_AWAY","HOME_AWAY","OVER_UNDER","ASIAN_HANDICAP"],"odds_tab":[]},"default_bet_type":"HOME_DRAW_AWAY"},"17":{"prematch_odds":{"summary_tab":["HOME_AWAY","ASIAN_HANDICAP"],"odds_tab":["HOME_DRAW_AWAY","HOME_AWAY","OVER_UNDER","ASIAN_HANDICAP","BOTH_TEAMS_TO_SCORE","TO_QUALIFY","DOUBLE_CHANCE","EUROPEAN_HANDICAP","DRAW_NO_BET","CORRECT_SCORE","HALF_FULL_TIME","ODD_OR_EVEN"]},"live_odds":{"summary_tab":["HOME_AWAY","ASIAN_HANDICAP"],"odds_tab":[]},"default_bet_type":"HOME_AWAY"},"16":{"prematch_odds":{"summary_tab":["HOME_AWAY","HOME_DRAW_AWAY"],"odds_tab":["HOME_AWAY","HOME_DRAW_AWAY","OVER_UNDER"]},"live_odds":{"summary_tab":["HOME_AWAY","HOME_DRAW_AWAY"],"odds_tab":[]},"default_bet_type":"HOME_AWAY"},"13":{"prematch_odds":{"summary_tab":["HOME_AWAY","HOME_DRAW_AWAY"],"odds_tab":["HOME_AWAY","HOME_DRAW_AWAY","OVER_UNDER","DOUBLE_CHANCE","ASIAN_HANDICAP"]},"live_odds":{"summary_tab":["HOME_AWAY","HOME_DRAW_AWAY"],"odds_tab":[]},"default_bet_type":"HOME_AWAY"},"34":{"prematch_odds":{"summary_tab":["TOP_POSITION_MERGED"],"odds_tab":[]},"live_odds":{"summary_tab":[],"odds_tab":[]},"default_bet_type":"TOP_POSITION_MERGED"},"36":{"prematch_odds":{"summary_tab":["HOME_AWAY"],"odds_tab":["HOME_DRAW_AWAY","HOME_AWAY","OVER_UNDER","ASIAN_HANDICAP","BOTH_TEAMS_TO_SCORE","TO_QUALIFY","DOUBLE_CHANCE","EUROPEAN_HANDICAP","DRAW_NO_BET","CORRECT_SCORE","HALF_FULL_TIME","ODD_OR_EVEN"]},"live_odds":{"summary_tab":["HOME_AWAY"],"odds_tab":[]},"default_bet_type":"HOME_AWAY"},"24":{"prematch_odds":{"summary_tab":["HOME_DRAW_AWAY"],"odds_tab":["HOME_DRAW_AWAY","HOME_AWAY","OVER_UNDER","ASIAN_HANDICAP","BOTH_TEAMS_TO_SCORE","TO_QUALIFY","DOUBLE_CHANCE","EUROPEAN_HANDICAP","DRAW_NO_BET","CORRECT_SCORE","HALF_FULL_TIME","ODD_OR_EVEN"]},"live_odds":{"summary_tab":["HOME_DRAW_AWAY"],"odds_tab":[]},"default_bet_type":"HOME_DRAW_AWAY"},"9":{"prematch_odds":{"summary_tab":["HOME_DRAW_AWAY","HOME_AWAY","OVER_UNDER","ASIAN_HANDICAP"],"odds_tab":["HOME_DRAW_AWAY","HOME_AWAY","OVER_UNDER","ASIAN_HANDICAP","BOTH_TEAMS_TO_SCORE","TO_QUALIFY","DOUBLE_CHANCE","EUROPEAN_HANDICAP","DRAW_NO_BET","CORRECT_SCORE","HALF_FULL_TIME","ODD_OR_EVEN"]},"live_odds":{"summary_tab":["HOME_DRAW_AWAY","HOME_AWAY","OVER_UNDER","ASIAN_HANDICAP"],"odds_tab":[]},"default_bet_type":"HOME_DRAW_AWAY"},"11":{"prematch_odds":{"summary_tab":["HOME_DRAW_AWAY","HOME_AWAY","OVER_UNDER","ASIAN_HANDICAP"],"odds_tab":["HOME_DRAW_AWAY","HOME_AWAY","OVER_UNDER","ASIAN_HANDICAP","BOTH_TEAMS_TO_SCORE","TO_QUALIFY","DOUBLE_CHANCE","EUROPEAN_HANDICAP","DRAW_NO_BET","CORRECT_SCORE","HALF_FULL_TIME","ODD_OR_EVEN"]},"live_odds":{"summary_tab":["HOME_DRAW_AWAY","HOME_AWAY","OVER_UNDER","ASIAN_HANDICAP"],"odds_tab":[]},"default_bet_type":"HOME_DRAW_AWAY"},"7":{"prematch_odds":{"summary_tab":["HOME_DRAW_AWAY","HOME_AWAY","OVER_UNDER","ASIAN_HANDICAP"],"odds_tab":["HOME_DRAW_AWAY","HOME_AWAY","OVER_UNDER","ASIAN_HANDICAP","BOTH_TEAMS_TO_SCORE","TO_QUALIFY","DOUBLE_CHANCE","EUROPEAN_HANDICAP","DRAW_NO_BET","CORRECT_SCORE","HALF_FULL_TIME","ODD_OR_EVEN"]},"live_odds":{"summary_tab":["HOME_DRAW_AWAY","HOME_AWAY","OVER_UNDER","ASIAN_HANDICAP"],"odds_tab":[]},"default_bet_type":"HOME_DRAW_AWAY"},"35":{"prematch_odds":{"summary_tab":["TOP_POSITION_MERGED"],"odds_tab":[]},"live_odds":{"summary_tab":[],"odds_tab":[]},"default_bet_type":"TOP_POSITION_MERGED"},"42":{"prematch_odds":{"summary_tab":["HOME_DRAW_AWAY"],"odds_tab":["HOME_DRAW_AWAY","HOME_AWAY","OVER_UNDER","ASIAN_HANDICAP","BOTH_TEAMS_TO_SCORE","TO_QUALIFY","DOUBLE_CHANCE","EUROPEAN_HANDICAP","DRAW_NO_BET","CORRECT_SCORE","HALF_FULL_TIME","ODD_OR_EVEN"]},"live_odds":{"summary_tab":["HOME_DRAW_AWAY"],"odds_tab":[]},"default_bet_type":"HOME_DRAW_AWAY"},"28":{"prematch_odds":{"summary_tab":["HOME_DRAW_AWAY","HOME_AWAY"],"odds_tab":["HOME_DRAW_AWAY","HOME_AWAY","OVER_UNDER","ASIAN_HANDICAP","BOTH_TEAMS_TO_SCORE","TO_QUALIFY","DOUBLE_CHANCE","EUROPEAN_HANDICAP","DRAW_NO_BET","CORRECT_SCORE","HALF_FULL_TIME","ODD_OR_EVEN"]},"live_odds":{"summary_tab":["HOME_DRAW_AWAY","HOME_AWAY"],"odds_tab":[]},"default_bet_type":"HOME_AWAY"},"31":{"prematch_odds":{"summary_tab":["TOP_POSITION_MERGED"],"odds_tab":[]},"live_odds":{"summary_tab":[],"odds_tab":[]},"default_bet_type":"TOP_POSITION_MERGED","duel_default_bet_type":"HOME_AWAY"},"32":{"prematch_odds":{"summary_tab":["TOP_POSITION_MERGED"],"odds_tab":[]},"live_odds":{"summary_tab":[],"odds_tab":[]},"default_bet_type":"TOP_POSITION_MERGED","duel_default_bet_type":"HOME_AWAY"},"33":{"prematch_odds":{"summary_tab":["TOP_POSITION_MERGED"],"odds_tab":["HOME_DRAW_AWAY","HOME_AWAY","OVER_UNDER","ASIAN_HANDICAP","BOTH_TEAMS_TO_SCORE","TO_QUALIFY","DOUBLE_CHANCE","EUROPEAN_HANDICAP","DRAW_NO_BET","CORRECT_SCORE","HALF_FULL_TIME","ODD_OR_EVEN"]},"live_odds":{"summary_tab":[],"odds_tab":[]},"default_bet_type":"TOP_POSITION_MERGED","duel_default_bet_type":"HOME_AWAY"},"29":{"prematch_odds":{"summary_tab":["HOME_AWAY","HOME_DRAW_AWAY"],"odds_tab":["HOME_DRAW_AWAY","HOME_AWAY","OVER_UNDER","ASIAN_HANDICAP","BOTH_TEAMS_TO_SCORE","TO_QUALIFY","DOUBLE_CHANCE","EUROPEAN_HANDICAP","DRAW_NO_BET","CORRECT_SCORE","HALF_FULL_TIME","ODD_OR_EVEN"]},"live_odds":{"summary_tab":["HOME_AWAY","HOME_DRAW_AWAY"],"odds_tab":[]},"default_bet_type":"HOME_AWAY"},"30":{"prematch_odds":{"summary_tab":["HOME_DRAW_AWAY"],"odds_tab":["HOME_DRAW_AWAY","HOME_AWAY","OVER_UNDER","ASIAN_HANDICAP","BOTH_TEAMS_TO_SCORE","TO_QUALIFY","DOUBLE_CHANCE","EUROPEAN_HANDICAP","DRAW_NO_BET","CORRECT_SCORE","HALF_FULL_TIME","ODD_OR_EVEN"]},"live_odds":{"summary_tab":["HOME_DRAW_AWAY"],"odds_tab":[]},"default_bet_type":"HOME_DRAW_AWAY"},"19":{"prematch_odds":{"summary_tab":["HOME_DRAW_AWAY","HOME_AWAY","OVER_UNDER","ASIAN_HANDICAP"],"odds_tab":["HOME_DRAW_AWAY","HOME_AWAY","OVER_UNDER","ASIAN_HANDICAP","BOTH_TEAMS_TO_SCORE","TO_QUALIFY","DOUBLE_CHANCE","EUROPEAN_HANDICAP","DRAW_NO_BET","CORRECT_SCORE","HALF_FULL_TIME","ODD_OR_EVEN"]},"live_odds":{"summary_tab":["HOME_DRAW_AWAY","HOME_AWAY","OVER_UNDER","ASIAN_HANDICAP"],"odds_tab":[]},"default_bet_type":"HOME_DRAW_AWAY"},"8":{"prematch_odds":{"summary_tab":["HOME_DRAW_AWAY","HOME_AWAY","OVER_UNDER","ASIAN_HANDICAP"],"odds_tab":["HOME_DRAW_AWAY","HOME_AWAY","OVER_UNDER","ASIAN_HANDICAP","BOTH_TEAMS_TO_SCORE","TO_QUALIFY","DOUBLE_CHANCE","EUROPEAN_HANDICAP","DRAW_NO_BET","CORRECT_SCORE","HALF_FULL_TIME","ODD_OR_EVEN"]},"live_odds":{"summary_tab":["HOME_DRAW_AWAY","HOME_AWAY","OVER_UNDER","ASIAN_HANDICAP"],"odds_tab":[]},"default_bet_type":"HOME_DRAW_AWAY"},"25":{"prematch_odds":{"summary_tab":["HOME_AWAY"],"odds_tab":["HOME_DRAW_AWAY","HOME_AWAY","OVER_UNDER","ASIAN_HANDICAP","BOTH_TEAMS_TO_SCORE","TO_QUALIFY","DOUBLE_CHANCE","EUROPEAN_HANDICAP","DRAW_NO_BET","CORRECT_SCORE","HALF_FULL_TIME","ODD_OR_EVEN"]},"live_odds":{"summary_tab":["HOME_AWAY"],"odds_tab":[]},"default_bet_type":"HOME_AWAY"},"22":{"prematch_odds":{"summary_tab":["HOME_DRAW_AWAY","HOME_AWAY","OVER_UNDER","ASIAN_HANDICAP"],"odds_tab":["HOME_DRAW_AWAY","HOME_AWAY","OVER_UNDER","ASIAN_HANDICAP","BOTH_TEAMS_TO_SCORE","TO_QUALIFY","DOUBLE_CHANCE","EUROPEAN_HANDICAP","DRAW_NO_BET","CORRECT_SCORE","HALF_FULL_TIME","ODD_OR_EVEN"]},"live_odds":{"summary_tab":["HOME_DRAW_AWAY","HOME_AWAY","OVER_UNDER","ASIAN_HANDICAP"],"odds_tab":[]},"default_bet_type":"HOME_DRAW_AWAY"},"37":{"prematch_odds":{"summary_tab":["TOP_POSITION_MERGED"],"odds_tab":[]},"live_odds":{"summary_tab":[],"odds_tab":[]},"default_bet_type":"TOP_POSITION_MERGED"},"38":{"prematch_odds":{"summary_tab":["TOP_POSITION_MERGED"],"odds_tab":[]},"live_odds":{"summary_tab":[],"odds_tab":[]},"default_bet_type":"TOP_POSITION_MERGED"},"39":{"prematch_odds":{"summary_tab":["TOP_POSITION_MERGED"],"odds_tab":[]},"live_odds":{"summary_tab":[],"odds_tab":[]},"default_bet_type":"TOP_POSITION_MERGED"},"40":{"prematch_odds":{"summary_tab":["TOP_POSITION_MERGED"],"odds_tab":[]},"live_odds":{"summary_tab":[],"odds_tab":[]},"default_bet_type":"TOP_POSITION_MERGED"},"41":{"prematch_odds":{"summary_tab":["TOP_POSITION_MERGED"],"odds_tab":[]},"live_odds":{"summary_tab":[],"odds_tab":[]},"default_bet_type":"TOP_POSITION_MERGED"}},"player_match_stats":{"card_enabled":true,"card_from_lineups_enabled":true,"card_rating_bonuses_enabled":true,"rating_article_link_url":""},"enable_betting_bonuses_in_live":{"geoip":[]},"momentum":{"article_link_url":""},"tournament_page":{"odds_tab":{"enabled":true},"duel":[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,21,22,24,25,26,28,29,30,23,36,42,33,32,34]},"badges_rating_scale":[{"data":{"1":{"best":"0033FF","nan":"555E61","scale":{"7.5":"0B7929","7.0":"76B100","6.5":"F3A000","5.8":"EC6B07","0.0":"DC0000"}},"4":{"best":"0033FF","nan":"555E61","scale":{"8.0":"0B7929","7.0":"76B100","6.5":"F3A000","6.0":"EC6B07","0.0":"DC0000"}},"3":{"best":"0033FF","nan":"555E61","scale":{"8.0":"0B7929","7.0":"76B100","6.5":"F3A000","6.0":"EC6B07","0.0":"DC0000"}}}}],"top_bar":{"local_storage_visibility_key":""},"sport_page":{"duel":[]},"sphinxsearch":{"server_domain":"s.livesport.services","search_path":"\/api\/v2\/search\/","top_search_path":"\/api\/v2\/top-search\/","enable":true,"disabled_sports_in_select":[32,33],"client_server":"s.livesport.services\/api\/v2\/search\/","top_search_client_server":"s.livesport.services\/api\/v2\/top-search\/"}},"ajax":{"sync_time":{"default":10,"update":5,"game":5,"live_tables":10},"goal_duration_time":60,"correction_duration_time":15,"penalty_duration_time":60,"counter_duration_time":60,"scores_changed_duration_time":60,"prematch_odds_sync_time":60,"prematch_odds_cache_time":180,"sql_cache_time":30},"cache":{"feed_x":"x"},"core_debugger":{"internal":false},"mobi":{"geoip_restriction":["GR"]},"push":{"namespace":"fs3_","domain":"fsdatacentre.com","alias":"p1tt2:100, p2tt2:100, p3tt2:100, p4tt2:100, p5tt2:100, p6tt2:100, p7tt2:100, p8tt2:100, p9tt2:100, p10tt2:100","port":443},"portable_apps":{"onelinks":{"login-sign-up-url":"","login-promo-app-form-url":"https:\/\/flashscore.onelink.me\/BvSv\/ivztoxiu","user-controls-app-promo-url":"https:\/\/flashscore.onelink.me\/BvSv\/tdyokl18"}}};cjs.Api.config.initConfig(cjs._config);    reset_env();
    var ajax = [];
    // runtime variables
    var prefered_sport_id;
    var matches;
    var sport = null;
    var sport_id = null;
    var country = null;
    var tournament = null;
    var participant = null;
    var series = null;
    cjs.pageTab = null;
    var updater = null;
    var category = 0;
    var sub_category = null;
    var page_is_initialized = false;
    var sudate = 0; // selected day server utime (GMT)
    var tudate;
    var refresh_utime = 0;
    var default_tz = default_tz || null;
    var interval_live = null;
    var bookmaker_link = '/bookmaker/';
    var odds_betslip = false;
    var ODDS_FORMAT_LIST = {"eu":{"id":1,"ident":"eu","name_iframe":"TRANS_ODDS_FORMAT_IFRAME_EU","name_detail":"TRANS_ODDS_FORMAT_DETAIL_EU","name_title":"TRANS_ODDS_FORMAT_TITLE_EU","example":"1.50"},"uk":{"id":2,"ident":"uk","name_iframe":"TRANS_ODDS_FORMAT_IFRAME_UK","name_detail":"TRANS_ODDS_FORMAT_DETAIL_UK","name_title":"TRANS_ODDS_FORMAT_TITLE_UK","example":"1\/2"},"us":{"id":3,"ident":"us","name_iframe":"TRANS_ODDS_FORMAT_IFRAME_US","name_detail":"TRANS_ODDS_FORMAT_DETAIL_US","name_title":"TRANS_ODDS_FORMAT_TITLE_US","example":"-200"},"hk":{"id":4,"ident":"hk","name_iframe":"TRANS_ODDS_FORMAT_IFRAME_HK","name_detail":"TRANS_ODDS_FORMAT_DETAIL_HK","name_title":"TRANS_ODDS_FORMAT_TITLE_HK","example":"0.50"},"ma":{"id":5,"ident":"ma","name_iframe":"TRANS_ODDS_FORMAT_IFRAME_MA","name_detail":"TRANS_ODDS_FORMAT_DETAIL_MA","name_title":"TRANS_ODDS_FORMAT_TITLE_MA","example":"0.50"},"in":{"id":6,"ident":"in","name_iframe":"TRANS_ODDS_FORMAT_IFRAME_IN","name_detail":"TRANS_ODDS_FORMAT_DETAIL_IN","name_title":"TRANS_ODDS_FORMAT_TITLE_IN","example":"-2.00"}};
    var counter_duration_time = 60;
    var project_type_id = 5;
    var project_type_name = '_fs';
    var locationOrigin = location.origin;
    if (typeof locationOrigin === "undefined")
    {
        locationOrigin = location.protocol + "//" + location.host;
    }
    var req_url = locationOrigin + '/x/' + 'req/';
    var u_304 = 'd41d8cd98f00b204e9800998ecf8427e';
    var default_odds_format   = 'eu';
    var service_status = 0;
    var ajax_updater = '';
    var swap = {};
    var odds_enable = false;
    var ff_data = '';
    var sys_interval_checker = null;
    var counter_update_interval = null;
    var calendar = {
        "buttons":{"prev_day":true,"next_day":true},
        "range":7    };
    // separators
    var JS_ROW_END        = '~';
    var JS_CELL_END        = '¬';
    var JS_INDEX        = '÷';
    // tooltip ident
    var tt = null;
    var xmt;
    var xmtpending = false;
    var componentRefresh = {};

    // push engine
    var mpe_delivery = 'a';

    var base_image_data_url = 'https://static.flashscore.com/res/image/' + 'data/';

    clientStorage = cjs.Api.clientStorage;
    cjs.Api.ajaxSyncTime.init(cjs.Api.config.get("ajax", "sync_time") || {});
    cjs.Api.timezone.initTimezone(
        cjs.dic.get('util_date'),
    );

    // iframe top lang box init variables
    var project_id = 0;

    // odds
    
    var odds_betting_types = {"1":1,"2":3,"3":3,"4":1,"5":3,"6":3,"7":1,"8":1,"9":1,"10":1,"11":1,"12":3,"18":3,"19":1,"13":3,"14":3,"15":3,"16":3,"17":3,"21":3,"22":1,"24":1,"25":3,"26":1,"28":3,"29":3,"30":1,"23":101,"31":101,"32":101,"33":101,"34":101,"35":16,"36":3,"37":101,"38":101,"39":101,"40":101,"41":101,"42":1};

    var SPORT_LIST = [];
    var SPORT_LIST_BY_ID = {};
    var SPORT_URL_BY_ID = [];
	SPORT_LIST['soccer'] = 1;
	SPORT_LIST_BY_ID['1'] = 'soccer';
	SPORT_URL_BY_ID['1'] = '/soccer/';
	SPORT_LIST['tennis'] = 2;
	SPORT_LIST_BY_ID['2'] = 'tennis';
	SPORT_URL_BY_ID['2'] = '/tennis/';
	SPORT_LIST['basketball'] = 3;
	SPORT_LIST_BY_ID['3'] = 'basketball';
	SPORT_URL_BY_ID['3'] = '/basketball/';
	SPORT_LIST['hockey'] = 4;
	SPORT_LIST_BY_ID['4'] = 'hockey';
	SPORT_URL_BY_ID['4'] = '/hockey/';
	SPORT_LIST['american-football'] = 5;
	SPORT_LIST_BY_ID['5'] = 'american-football';
	SPORT_URL_BY_ID['5'] = '/american-football/';
	SPORT_LIST['baseball'] = 6;
	SPORT_LIST_BY_ID['6'] = 'baseball';
	SPORT_URL_BY_ID['6'] = '/baseball/';
	SPORT_LIST['handball'] = 7;
	SPORT_LIST_BY_ID['7'] = 'handball';
	SPORT_URL_BY_ID['7'] = '/handball/';
	SPORT_LIST['rugby-union'] = 8;
	SPORT_LIST_BY_ID['8'] = 'rugby-union';
	SPORT_URL_BY_ID['8'] = '/rugby-union/';
	SPORT_LIST['floorball'] = 9;
	SPORT_LIST_BY_ID['9'] = 'floorball';
	SPORT_URL_BY_ID['9'] = '/floorball/';
	SPORT_LIST['bandy'] = 10;
	SPORT_LIST_BY_ID['10'] = 'bandy';
	SPORT_URL_BY_ID['10'] = '/bandy/';
	SPORT_LIST['futsal'] = 11;
	SPORT_LIST_BY_ID['11'] = 'futsal';
	SPORT_URL_BY_ID['11'] = '/futsal/';
	SPORT_LIST['volleyball'] = 12;
	SPORT_LIST_BY_ID['12'] = 'volleyball';
	SPORT_URL_BY_ID['12'] = '/volleyball/';
	SPORT_LIST['cricket'] = 13;
	SPORT_LIST_BY_ID['13'] = 'cricket';
	SPORT_URL_BY_ID['13'] = '/cricket/';
	SPORT_LIST['darts'] = 14;
	SPORT_LIST_BY_ID['14'] = 'darts';
	SPORT_URL_BY_ID['14'] = '/darts/';
	SPORT_LIST['snooker'] = 15;
	SPORT_LIST_BY_ID['15'] = 'snooker';
	SPORT_URL_BY_ID['15'] = '/snooker/';
	SPORT_LIST['boxing'] = 16;
	SPORT_LIST_BY_ID['16'] = 'boxing';
	SPORT_URL_BY_ID['16'] = '/boxing/';
	SPORT_LIST['beach-volleyball'] = 17;
	SPORT_LIST_BY_ID['17'] = 'beach-volleyball';
	SPORT_URL_BY_ID['17'] = '/beach-volleyball/';
	SPORT_LIST['aussie-rules'] = 18;
	SPORT_LIST_BY_ID['18'] = 'aussie-rules';
	SPORT_URL_BY_ID['18'] = '/aussie-rules/';
	SPORT_LIST['rugby-league'] = 19;
	SPORT_LIST_BY_ID['19'] = 'rugby-league';
	SPORT_URL_BY_ID['19'] = '/rugby-league/';
	SPORT_LIST['badminton'] = 21;
	SPORT_LIST_BY_ID['21'] = 'badminton';
	SPORT_URL_BY_ID['21'] = '/badminton/';
	SPORT_LIST['water-polo'] = 22;
	SPORT_LIST_BY_ID['22'] = 'water-polo';
	SPORT_URL_BY_ID['22'] = '/water-polo/';
	SPORT_LIST['golf'] = 23;
	SPORT_LIST_BY_ID['23'] = 'golf';
	SPORT_URL_BY_ID['23'] = '/golf/';
	SPORT_LIST['field-hockey'] = 24;
	SPORT_LIST_BY_ID['24'] = 'field-hockey';
	SPORT_URL_BY_ID['24'] = '/field-hockey/';
	SPORT_LIST['table-tennis'] = 25;
	SPORT_LIST_BY_ID['25'] = 'table-tennis';
	SPORT_URL_BY_ID['25'] = '/table-tennis/';
	SPORT_LIST['beach-soccer'] = 26;
	SPORT_LIST_BY_ID['26'] = 'beach-soccer';
	SPORT_URL_BY_ID['26'] = '/beach-soccer/';
	SPORT_LIST['mma'] = 28;
	SPORT_LIST_BY_ID['28'] = 'mma';
	SPORT_URL_BY_ID['28'] = '/mma/';
	SPORT_LIST['netball'] = 29;
	SPORT_LIST_BY_ID['29'] = 'netball';
	SPORT_URL_BY_ID['29'] = '/netball/';
	SPORT_LIST['pesapallo'] = 30;
	SPORT_LIST_BY_ID['30'] = 'pesapallo';
	SPORT_URL_BY_ID['30'] = '/pesapallo/';
	SPORT_LIST['motorsport'] = 31;
	SPORT_LIST_BY_ID['31'] = 'motorsport';
	SPORT_URL_BY_ID['31'] = '/motorsport/';
	SPORT_LIST['motorsport-auto-racing'] = 32;
	SPORT_LIST_BY_ID['32'] = 'motorsport-auto-racing';
	SPORT_URL_BY_ID['32'] = '/auto-racing/';
	SPORT_LIST['motorsport-moto-racing'] = 33;
	SPORT_LIST_BY_ID['33'] = 'motorsport-moto-racing';
	SPORT_URL_BY_ID['33'] = '/moto-racing/';
	SPORT_LIST['cycling'] = 34;
	SPORT_LIST_BY_ID['34'] = 'cycling';
	SPORT_URL_BY_ID['34'] = '/cycling/';
	SPORT_LIST['horse-racing'] = 35;
	SPORT_LIST_BY_ID['35'] = 'horse-racing';
	SPORT_URL_BY_ID['35'] = '/horse-racing/';
	SPORT_LIST['esports'] = 36;
	SPORT_LIST_BY_ID['36'] = 'esports';
	SPORT_URL_BY_ID['36'] = '/esports/';
	SPORT_LIST['winter-sports'] = 37;
	SPORT_LIST_BY_ID['37'] = 'winter-sports';
	SPORT_URL_BY_ID['37'] = '/winter-sports/';
	SPORT_LIST['winter-sports-ski-jumping'] = 38;
	SPORT_LIST_BY_ID['38'] = 'winter-sports-ski-jumping';
	SPORT_URL_BY_ID['38'] = '/ski-jumping/';
	SPORT_LIST['winter-sports-alpine-skiing'] = 39;
	SPORT_LIST_BY_ID['39'] = 'winter-sports-alpine-skiing';
	SPORT_URL_BY_ID['39'] = '/alpine-skiing/';
	SPORT_LIST['winter-sports-cross-country'] = 40;
	SPORT_LIST_BY_ID['40'] = 'winter-sports-cross-country';
	SPORT_URL_BY_ID['40'] = '/cross-country-skiing/';
	SPORT_LIST['winter-sports-biathlon'] = 41;
	SPORT_LIST_BY_ID['41'] = 'winter-sports-biathlon';
	SPORT_URL_BY_ID['41'] = '/biathlon/';
	SPORT_LIST['kabaddi'] = 42;
	SPORT_LIST_BY_ID['42'] = 'kabaddi';
	SPORT_URL_BY_ID['42'] = '/kabaddi/';

    var SPORT_SCORE_PART_LIST = window.SPORT_SCORE_PART_LIST || [];
    var TXT_SPORT = window.TXT_SPORT || [];
    var TXT_SPORT_MOBILE = window.TXT_SPORT_MOBILE || [];
    var gamePlanSettings = ["", ""];
    var tournamentPage = false;
    var tournamentPageDataPart = 0;
    var feedIndexes = cjs.constants.FEED;

        //login client init
    function lsid_init()
    {
        cjs.Api.settingsStorage.init(cjs.dic.get('lsidClientFactory').getInstance());
    }
    cjs.fromGlobalScope.lsid_init = lsid_init;

    //My leagues init
    function my_leagues_init(sportId)
    {
        var utilTrans = cjs.dic.get('utilTrans');
        if(typeof cjs.myLeagues == 'undefined')
        {
            lsid_init();

            var mlTranslations = {
                add: utilTrans.translate('TRANS_MY_LEAGUES_PIN') || "",
                remove: utilTrans.translate('TRANS_MY_LEAGUES_UNPIN') || "",
                loginNeeded: utilTrans.translate('TRANS_ERROR_AVAILABLE_ONLY_FOR_LOGGED_USER') || "",
            };
            cjs.myLeagues = cjs.dic.get("MyLeaguesFactory").create(
                cjs.dic.get('MyLeaguesClientFactory').create(),
                cjs.defaultTopLeagues,
                sportId,
                mlTranslations,
                cjs.dic.get("util_sport"),
                cjs.dic.get("util_page"),
                cjs.dic.get("util_enviroment"),
                window.fetch.bind(window),
                cjs.Api.config,
            );
            cjs.myLeagues.registerCallback('add', sort_fs_data);
            cjs.myLeagues.registerCallback('remove', sort_fs_data);

            var reloadTabContent = function() {
                cjs.Api.loader.get('reactCalls').call(function(reactCalls) {
                    reactCalls.reloadTabContent(category);
                    reactCalls.reloadStaticContent();
                });
            };
            cjs.myLeagues.registerCallback('add', reloadTabContent);
            cjs.myLeagues.registerCallback('remove', reloadTabContent);
            cjs.Api.loader.get('myLeagues').fulfill(function(callback) {
                callback(cjs.myLeagues);
            });
        }
    }

    cjs.fromGlobalScope.my_leagues_init = my_leagues_init;

    function myTeamsInit(sportId)
    {
        if (typeof cjs.myTeams == 'undefined' && cjs.Api.config.get('app', 'myteams', 'enable') && !cjs.xmtpending)
        {
            cjs.xmtpending = true;
            lsid_init();
            cjs.Api.loader.get('xMyTeams').call({}, function(_mt) {
                cjs.xmt = _mt;
                cjs.myTeams = _mt;
                var myGamesChecker = cjs.dic.get('Helper_MyGamesChecker');

                var drawMenu = function(participantKey)
                {
                    var participantKeySportId = sportId;

                    if (participantKey)
                    {
                        participantKeySportId = parseInt(participantKey.replace(/^([0-9]+)_.* /, '$1'));
                    }

                    if (sportId == participantKeySportId)
                    {
                        cjs.myTeams.animateLeftMenu();
                    }

                    cjs.myTeams.reloadToggleIcons();
                };

                cjs.myTeams.registerCallback('dataLoaded', drawMenu);
                cjs.myTeams.registerCallback('dataLoaded', function() {
                    sort_fs_data();

                    var myTeamsCount = cjs.myTeams.getCount();
                    if (myGamesChecker.isMyGames() && myTeamsCount)
                    {
                        loadAndShowMygamesContent();
                    }
                });
                cjs.Api.loader.get("loggedInObservable").call((observable) => {
                    observable.subscribe(() => {
                        cjs.myTeams.animateLeftMenu();
                        cjs.myTeams.reloadToggleIcons();
                    });
                    observable.subscribe((loggedIn) => {
                        if (loggedIn) {
                            cjs.myTeams.animateLeftMenu(true);
                            cjs.myTeams.synchronize(0).then((data) => {
                                cjs.myTeams.animateLeftMenu();
                            });
                            cjs.myTeams.restartAutoSync();
                        } else {
                            cjs.myTeams.stopAutoSync();
                        }
                    });
                });
                const lsidClient = cjs.dic.get('lsidClientFactory').getInstance();
                lsidClient.storage.getInnerDataObservable(["myTeams"]).subscribe(
                    (function(drawMenu) {
                        return function()
                        {
                            cjs.myTeams.reload();
                            drawMenu();
                            if (myGamesChecker.isMyGames())
                            {
                                redrawLivescore();
                            }
                        }
                    })(drawMenu)
                );

                cjs.myTeams.registerCallback('remove', drawMenu);
                drawMenu = null;

                cjs.Api.loader.get('myTeams').fulfill(function(callback) {
                    callback(cjs.myTeams);
                });
            });
        }
    }

    cjs.fromGlobalScope.myTeamsInit = myTeamsInit;

    
// Core functions {{{

    /**
 * Parse data from input string to data array
    */
    function parse(fs_input, update, odds, action)
    {
        var dataEventHolder = cjs.dic.get('dataEventHolderProxy').getHolder();
        var dataLeagueHolder = cjs.dic.get('dataLeagueHolderProxy').getHolder();
        var dataParticipantHolder = cjs.dic.get('dataParticipantHolder');
        var myGamesChecker = cjs.dic.get('Helper_MyGamesChecker');
        var changesHistoryContainer = cjs.dic.get('ChangesHistoryContainer');
        // test if there is input string
        if (fs_input == null || fs_input.length < 4 || fs_input == '0')
        {
            u_304 = 'd41d8cd98f00b204e9800998ecf8427e';
            return true;
        }
        update = (typeof update == 'undefined' || update == false) ? false : true;
        odds = (typeof odds == 'undefined' || odds == false) ? false : true;
        var eventItem, leagueItem, upcomingDrawItem;
        var rows = fs_input.split(JS_ROW_END);
        var rows_length = rows.length;
        var labl_id;
        var parse_sport_id = sport_id;
        var parse_sport = sport;
        var return_val = true;
        var eventId, tmp;
        var special = false;
        var isMyTeamsAction = (typeof cjs.myTeams !== 'undefined' && action === "my-teams-events-data-merged");
        var isRepairAction = (action == 'repair' || action == 'frepair');
        var reloadEvents = [];
        var reloadLeagues = [];
        var reloadTabContent = false;
        var sortTabContent = false;
        var isMyTeamsFeed = action === 'my-teams-events-data-merged';
        var isMyGamesScope = cjs.dic.get('dataLeagueHolderProxy').getScope() === 'mygames';

        if (!update && !odds && !isRepairAction)
        {
            if (rows_length == 1)
            {
                rows_length = 0;
            }
        }

        // parse data
        for (var i = 0; i < rows_length; i++)
        {
            var row = rows[i].split(JS_CELL_END);
            var row_length = row.length - 1;
            var index = row[0].split(JS_INDEX);
            var indexName, indexValue;
            if (typeof index[0] !== 'undefined')
            {
                indexName = index[0];
            }
            if (typeof index[1] !== 'undefined')
            {
                indexValue = index[1];
            }

            // sport
            if (indexName === feedIndexes.SHAREDINDEXES_SPORT_ID)
            {
                parse_sport_id = indexValue;
                parse_sport = SPORT_LIST_BY_ID[parse_sport_id];
                continue;
            }
            else if (indexName === feedIndexes.DCAPIPARTICIPANTINDEXES_TEAM_INFO || indexName == feedIndexes.DCAPIPARTICIPANTINDEXES_TEAM_INFO_DELETED)
            {
                for (var j = 0; j < row_length; j++)
                {
                    var tmpIndex = row[j].split(JS_INDEX);
                    var key = tmpIndex[0];
                    var value = tmpIndex[1];
                    if (key == feedIndexes.DCAPIPARTICIPANTINDEXES_TEAM_INFO || key == feedIndexes.DCAPIPARTICIPANTINDEXES_TEAM_INFO_DELETED)
                    {
                        var participantData = value.split('|');
                        var participantId = participantData[0];
                        var participantItem = dataParticipantHolder.getOrCreateNewParticipant(participantId);
                        participantItem.reinit(participantData);
                        participantItem.setDeleted(key == feedIndexes.DCAPIPARTICIPANTINDEXES_TEAM_INFO_DELETED);
                    }
                    else if (key == feedIndexes.LOCALIZEKEYINDEXES_PARTICIPANT_EVENTS_CLASS_LOCALIZED_VAR)
                    {
                        cjs.Api.dataItemTranslator.updateDictionary(value);
                    }
                }

                continue;
            }
            else if (!isMyTeamsFeed || isMyGamesScope) {
                // caption
                if (indexName === feedIndexes.SHAREDINDEXES_TOURNAMENT_NAME)
                {
                    var tmp_labl = {};
                    var backupedLeagueItem = cjs.dic.getNewInstance('Data_LeagueItem');

                    if (cjs.noDuelSports.includes(parse_sport_id))
                    {
                        tmp_labl[feedIndexes.SHAREDINDEXES_EVENT_STAGE_TYPE_ID] = '';
                        tmp_labl[feedIndexes.SHAREDINDEXES_EVENT_STAGE_ID] = '';
                        tmp_labl[feedIndexes.SHAREDINDEXES_MATCH_START_UTIME] = '';
                    }

                    for (var j = 0; j < row_length; j++)
                    {
                        var rowParts = row[j].split(JS_INDEX);
                        if (rowParts.length == 2)
                        {
                            tmp_labl[rowParts[0]] = rowParts[1];
                        }
                    }

                    //    display status of tournament's games [open/close icon]
                    tmp_labl['display'] = tmp_labl[feedIndexes.LEAGUEINDEXES_TOURNAMENT_TYPE] != 'c';
                    tmp_labl['g_count'] = 0;
                    tmp_labl['sport_id'] = parse_sport_id;
                    tmp_labl['sport'] = parse_sport;
                    labl_id = parse_sport_id + '_' + tmp_labl[feedIndexes.SHAREDINDEXES_TOURNAMENT_STAGE_ID];

                    if (isMyTeamsAction)
                    {
                        var mgLeagueData = cjs.mygames.getLabels();
                        if (mgLeagueData[labl_id] != null)
                        {
                            tmp_labl['g_count'] = mgLeagueData[labl_id]['g_count'];
                        }
                    }

                    if (dataLeagueHolder.hasLeague(labl_id))
                    {
                        var backupedLeagueItemData = dataLeagueHolder.getLeague(labl_id).getData();
                        backupedLeagueItem.reinit(backupedLeagueItemData);
                        tmp_labl['g_count'] = backupedLeagueItem.getEventCount();
                    }

                    if (isRepairAction)
                    {
                        if (dataLeagueHolder.hasLeague(labl_id))
                        {
                            leagueItem = dataLeagueHolder.getLeague(labl_id);
                            for (var key in tmp_labl)
                            {
                                if (key.length > 2 || (key == feedIndexes.SHAREDINDEXES_TOURNAMENT_NAME && tmp_labl[key] == ''))
                                {
                                    continue;
                                }
                                leagueItem.setValue(key, tmp_labl[key]);
                            }
                        }
                    }
                    else if (!update)
                    {
                        leagueItem = dataLeagueHolder.getOrCreateNewLeague(labl_id);
                        leagueItem.reinit(tmp_labl);
                    }
                    else if (update && labl_id)
                    {
                        if (dataLeagueHolder.hasLeague(labl_id))
                        {
                            leagueItem = dataLeagueHolder.getLeague(labl_id);
                            for (var key in tmp_labl)
                            {
                                if (key.length > 2 || (key == feedIndexes.SHAREDINDEXES_TOURNAMENT_NAME && tmp_labl[key] == '') || tmp_labl[key] == leagueItem.getValue(key))
                                {
                                    continue;
                                }
                                leagueItem.setValue(key, tmp_labl[key]);
                            }
                        }
                    }

                    if (leagueItem)
                    {
                        leagueItem = cjs.Api.dataItemTranslator.translate(leagueItem, backupedLeagueItem);
                        reloadLeagues.push(leagueItem.getId());
                    }
                }
                // upcoming draw row in league
                else if (indexName === feedIndexes.SHAREDINDEXES_UPCOMING_DRAW_ID)
                {
                    upcomingDrawItem = cjs.dic.getNewInstance('Data_UpcomingDrawItem');
                    for (var j = 1; j < row_length; j++)
                    {
                        var rowParts = row[j].split(JS_INDEX);
                        if (rowParts.length != 2)
                        {
                            continue;
                        }

                        var cellKey = rowParts[0];
                        var cellValue = rowParts[1];
                        if (cellKey == feedIndexes.DRAWINDEXES_UPCOMING_DRAW_START_TIME)
                        {
                            upcomingDrawItem.addEventStartTime(parseInt(cellValue));
                        }
                        else
                        {
                            if (cellKey == feedIndexes.SHAREDINDEXES_TOURNAMENT_STAGE_ID)
                            {
                                labl_id = parse_sport_id + '_' + tmp_labl[feedIndexes.SHAREDINDEXES_TOURNAMENT_STAGE_ID];
                            }
                            upcomingDrawItem.setValue(cellKey, cellValue);
                        }
                    }

                    if (dataLeagueHolder.hasLeague(labl_id))
                    {
                        dataLeagueHolder.getLeague(labl_id).addUpcomingDraw(upcomingDrawItem);
                    }
                }
                else if (indexName === feedIndexes.FULLFEEDINDEXES_MOVED_EVENTS_ID)
                {
                    for(var j = 0; j < row_length; j++)
                    {
                        switch(row[j].substr(0,2))
                        {
                            case feedIndexes.FULLFEEDINDEXES_EVENT_WITH_UPDATED_START:
                                eventId = 'g_' + parse_sport_id + '_' + row[j].substr(3);
                            break;
                            case feedIndexes.FULLFEEDINDEXES_EVENT_WITH_UPDATED_START_AND_END_TIME:
                                if (eventId)
                                {
                                    tmp = (row[j].substr(3) + "").split('|');
                                    fsEventsUpdatedStartTime[eventId] =
                                        {
                                            start_time: parseInt(tmp[0]),
                                            end_time: tmp[1] ? parseInt(tmp[1]) : null
                                        };
                                    eventId = null;
                                }
                            break;
                        }
                    }
                    continue;
                }

                else if (indexName === feedIndexes.STANDINGSSIGNSINDEXES_TABLE_HASH && indexValue === 'repair')
                {
                    special = true;
                    var repairRows = [];
                    for (var j = i + 1; j < rows_length; j++)
                    {
                        repairRows.push(rows[j]);
                        i++;
                        if (rows[j].split(JS_CELL_END)[0].split(JS_INDEX)[0] === feedIndexes.SHAREDINDEXES_FEED_SIGNATURE)
                        {
                            break;
                        }
                    }
                    continue;
                }
                // u_304 code
                else if (indexName === feedIndexes.SHAREDINDEXES_FEED_SIGNATURE)
                {
                    if (typeof action != 'undefined' && action == 'update')
                    {
                        u_304 = indexValue;
                    }

                    rows_length--;
                    continue;
                }
                // refresh utime
                else if(indexName === feedIndexes.SHAREDINDEXES_REFRESH_UTIME)
                {
                    var tmp_refresh_utime = indexValue - 0;

                    if (tmp_refresh_utime > refresh_utime)
                    {
                        refresh_utime = tmp_refresh_utime;
                        return_val = false;
                    }
                }
                // download local update feed
                else if (indexName === feedIndexes.SHAREDINDEXES_UPDATE_LOCAL_FEED_UPDATED_TIME)
                {
                    tmp = indexValue - 0;
                    if (tmp)
                    {
                        cjs.dic.get('Feed_Service_LocalUpdate').setSyncTime(tmp);
                    }
                }
                // no game today, past/upcoming game
                else if (indexName === feedIndexes.FULLFEEDINDEXES_PAST_FUTURE_GAMES)
                {
                    gamePlanSettings = indexValue.split(";");
                }
                // game row
                else if (indexName === feedIndexes.SHAREDINDEXES_EVENT_ID)
                {
                    var original_id = indexValue;
                    var id = 'g_' + parse_sport_id + '_' + original_id;
                    var backupedEventItem = cjs.dic.getNewInstance('Data_EventItem');
                    var eventItemExists = dataEventHolder.hasEvent(id);

                    // unknown game on update/repair or odds feed

                    if ((update || isRepairAction || odds) && !eventItemExists)
                    {
                        continue;
                    }

                    reloadEvents.push(id);

                    if (eventItemExists)
                    {
                        var backupedEventItemData = dataEventHolder.getItem(id).getData();
                        backupedEventItem.reinit(backupedEventItemData);
                    }
                    // create new event entry
                    eventItem = dataEventHolder.getOrCreateNewEvent(id);
                    if (!eventItemExists && !update && !odds && !isRepairAction)
                    {
                        if (!myGamesChecker.isMyGames() || !isMyTeamsAction)
                        {
                            leagueItem.setValue('g_count', leagueItem.getEventCount() + 1);
                        }
                        eventItem.reinit(eventItem.createDefaultMatchItem(parseInt(parse_sport_id), parse_sport, SPORT_SCORE_PART_LIST));
                        eventItem.setValue('original_id', original_id);
                        eventItem.setValue('labl_id', labl_id);
                        eventItem.setValue('sport_id', parse_sport_id);
                        eventItem.setValue('sport', parse_sport);
                    }

                    var statsResultsHelper = cjs.dic.getNewInstance('Helper_StatsResultsParser');
                    for (var j = 1; j < row_length; j++)
                    {
                        var rowParts = row[j].split(JS_INDEX);
                        if (rowParts.length != 2)
                        {
                            continue;
                        }

                        var key = rowParts[0];
                        var new_value_string = rowParts[1];

                        if (update && [
                            feedIndexes.ODDSINDEXES_ODDS_1_PREVIOUS,
                            feedIndexes.ODDSINDEXES_ODDS_0_PREVIOUS,
                            feedIndexes.ODDSINDEXES_ODDS_2_PREVIOUS,
                            feedIndexes.ODDSINDEXES_ODDS_10_PREVIOUS,
                            feedIndexes.ODDSINDEXES_ODDS_02_PREVIOUS,
                            feedIndexes.ODDSINDEXES_ODDS_AH1_PREVIOUS,
                            feedIndexes.ODDSINDEXES_ODDS_AH2_PREVIOUS,
                            feedIndexes.ODDSINDEXES_ODDS_OU1_PREVIOUS,
                            feedIndexes.ODDSINDEXES_ODDS_OU2_PREVIOUS,
                            feedIndexes.ODDSINDEXES_ODDS_ML1_PREVIOUS,
                            feedIndexes.ODDSINDEXES_ODDS_ML2_PREVIOUS].includes(key))
                        {
                            continue;
                        }

                        if ([
                            feedIndexes.UPDATEINDEXES_HOME_PENALTY_SHOT,
                            feedIndexes.UPDATEINDEXES_AWAY_PENALTY_SHOT,
                            feedIndexes.UPDATEINDEXES_HOME_PENALTY_MISSED,
                            feedIndexes.UPDATEINDEXES_AWAY_PENALTY_MISSED].includes(key))
                        {
                            continue;
                        }

                        var new_value = new_value_string;
                        if (![
                            feedIndexes.SHAREDINDEXES_TIME,
                            feedIndexes.SHAREDINDEXES_GAP,
                            feedIndexes.SHAREDINDEXES_HOME_CRICKET_RUN_RATE,
                            feedIndexes.SHAREDINDEXES_AWAY_CRICKET_RUN_RATE,
                            feedIndexes.RESULTSINDEXES_ROW_VALUE].includes(key))
                        {
                            new_value -= 0; // try convert string to number
                        }

                        if (isNaN(new_value) || new_value_string == '')
                        {
                            new_value = new_value_string;
                        }

                        if ((update || odds) && parseInt(cjs.dic.get('dataEvent').getEventValue(id, feedIndexes.FULLFEEDINDEXES_SWAPPED_PARTICIPANTS)))
                        {
                            var swappedParticipantsHandler = cjs.Api.swappedParticipantsHandlerFactory.make(key, new_value, false);
                            key = swappedParticipantsHandler.getKey();
                            new_value = swappedParticipantsHandler.getValue();
                        }

                        if (key === feedIndexes.ODDSINDEXES_EACH_WAY_HANDICAP && reloadLeagues.indexOf(eventItem.getLeagueId()) === -1)
                        {
                            reloadLeagues.push(eventItem.getLeagueId());
                        }

                        if (key === feedIndexes.FULLFEEDINDEXES_TEAM_NAME && (!update && !odds && !special) && typeof participantItem != 'undefined' && eventItem.isValid() && participantItem.getTeamName())
                        {
                            new_value = participantItem.getTeamName();
                        }

                        if (!statsResultsHelper.isStatsResultsIndex(key))
                        {
                            if (update && eventItem.getValue(key) !== new_value)
                            {
                                changesHistoryContainer.setValueChange(id, key, new_value, eventItem.getValue(key));
                            }

                            eventItem.setValue(key, new_value);
                        }

                        // get statsResults
                        statsResultsHelper.setHomeAndAwayParticipantIdsFromEventItem(eventItem);
                        statsResultsHelper.processKeyAndValue(key, new_value);
                    }

                    // update and save statsResults
                    var statsResults = statsResultsHelper.getStatsResults();
                    for (var statsResultsKey in statsResults)
                    {
                        new_value = statsResults[statsResultsKey];
                        if (update && eventItem.getValue(statsResultsKey) !== new_value)
                        {
                            changesHistoryContainer.setValueChange(id, statsResultsKey, new_value, eventItem.getValue(statsResultsKey));
                        }

                        eventItem.setValue(statsResultsKey, new_value);
                    }

                    // penalty
                    if (action == 'update')
                    {
                        for (var j = 1; j < row_length; j++)
                        {
                            var key = row[j].substr(0, 2);
                            if ([
                                    feedIndexes.UPDATEINDEXES_HOME_PENALTY_SHOT,
                                    feedIndexes.UPDATEINDEXES_AWAY_PENALTY_SHOT,
                                    feedIndexes.UPDATEINDEXES_HOME_PENALTY_MISSED,
                                    feedIndexes.UPDATEINDEXES_AWAY_PENALTY_MISSED].includes(key))
                            {
                                var new_value_arr = row[j].substr(3).split(',');
                                var incidentTime = new_value_arr[1] / 60;
                                var updatedTime = new_value_arr[2];
                                var incidentId = new_value_arr[3];

                                if (new_value_arr[0] == eventItem.getStage())
                                {
                                    var counterTimeGetter = cjs.Api.loader.get('counterTime');
                                    counterTimeGetter.call(eventItem, function(counterTime) {
                                        var interval = 5;
                                        if (incidentTime >= counterTime - interval && incidentTime <= counterTime + interval)
                                        {
                                            new_value = [updatedTime, incidentId];
                                            if (eventItem.getValue(key) !== new_value)
                                            {
                                                changesHistoryContainer.setValueChange(id, key, new_value, eventItem.getValue(key));
                                                eventItem.setValue(key, new_value);
                                            }
                                        }
                                    });
                                }
                            }
                            else if (cjs.noDuelSports.includes(eventItem.getSportId()))
                            {
                                if ([
                                    feedIndexes.SHAREDINDEXES_EVENT_STAGE_TYPE_ID,
                                    feedIndexes.SHAREDINDEXES_EVENT_STAGE_ID,
                                    feedIndexes.SHAREDINDEXES_MATCH_START_UTIME].includes(key))
                                {
                                    reloadTabContent = true;
                                }
                            }
                            else if (key === feedIndexes.SHAREDINDEXES_EVENT_STAGE_TYPE_ID
                                && category !== 0
                                && changesHistoryContainer.didValueChanged(id, feedIndexes.SHAREDINDEXES_EVENT_STAGE_TYPE_ID))
                            {
                                reloadTabContent = true;
                            }
                            else if (key === feedIndexes.SHAREDINDEXES_MATCH_START_UTIME
                                && changesHistoryContainer.didValueChanged(id, feedIndexes.SHAREDINDEXES_MATCH_START_UTIME))
                            {
                                reloadTabContent = true;
                                sortTabContent = true;
                            }
                        }
                    }

                    eventItem = cjs.Api.dataItemTranslator.translate(eventItem, backupedEventItem);

                    var page = cjs.dic.get('util_page');
                    var check_start_times = category != 5 && typeof action == 'undefined' && !odds && !update && !page.isCountryPage() && !page.isSeasonPage();
                    var removeEventByTime = check_start_times &&
                        !cjs.dic.get('utilDate').getMatchDay(eventItem.getStartTime(), eventItem.getEndTime()).includes(parseInt(sudate)) &&
                        !eventItem.isLive();
                    var removeEventByInvalidLeague = !eventItem.getLeague().isValid();
                    if (removeEventByTime || !eventItem.isValid() || removeEventByInvalidLeague)
                    {
                        if ((!myGamesChecker.isMyGames() || !isMyTeamsAction) && leagueItem)
                        {
                            leagueItem.setValue('g_count', leagueItem.getEventCount() - 1);
                        }
                        dataEventHolder.removeEvent(id);
                        changesHistoryContainer.removeNewData(id);
                    }

                    if (!update && !odds && !special)
                    {
                        if (typeof participantItem != 'undefined' && eventItem.isValid())
                        {
                            participantItem.addEventId(eventItem.getId());
                        }
                    }
                }
            }
        }

        fs_input = null;

        if (special && repairRows.length > 0)
        {
            parse(repairRows.join(JS_ROW_END), false, false, "frepair");
        }

        var leaguesInHolder = dataLeagueHolder.getReferences();
        for (var leagueId in leaguesInHolder)
        {
            if (!leaguesInHolder[leagueId].isValid())
            {
                dataLeagueHolder.removeLeague(leagueId);
                reloadLeagues.push(leagueId);
            }
        }

        var isUpdateAction = update || isRepairAction || odds;

        if (isUpdateAction && cjs.dic.get("util_page").getPageType() != 'player_page')
        {
            if (reloadTabContent)
            {
                if (sortTabContent)
                {
                    sort_fs_data();
                }

                cjs.Api.loader.get('reactCalls').call(function(reactCalls) {
                    reactCalls.reloadTabContent(category);
                });
            }
            else
            {
                cjs.Api.loader.get('reactCalls').call(function(reactCalls) {
                    for (var reloadEventId in reloadEvents)
                    {
                        reactCalls.reloadEvent(reloadEvents[reloadEventId]);
                    }
                    for (var reloadLeagueId in reloadLeagues)
                    {
                        reactCalls.reloadLeague(reloadLeagues[reloadLeagueId]);
                    }
                });
            }
        }

        return return_val;
    };

    function sort_fs_data()
    {
        cjs.dic.get('dataLeagueHolderProxy').getHandler().resetIds();
        var dataHandler = cjs.dic.get('dataEventHolderProxy').getHandler();
        var utilPage = cjs.dic.get("util_page");
        dataHandler.resetIds();

        if (!cjs.dic.get("util_sport").hasCategoryPage(sport_id) && utilPage.isCountryPage())
        {
            return;
        }
        dataHandler.sort();
    };

    /**
 * Reset data variables
    */
    function reset_env()
    {
        if (typeof cjs !== 'undefined' && cjs.dic != null)
        {
            cjs.dic.get('dataEventHolderProxy').eachHolder(function(scope, holder)
            {
                if (!['mygames', 'default', 'temporary'].includes(scope))
                {
                    return;
                }
                holder.reinit();
            });
            cjs.dic.get('dataLeagueHolderProxy').eachHolder(function(scope, holder)
            {
                if (!['mygames', 'default', 'temporary'].includes(scope))
                {
                    return;
                }
                holder.reinit();
            });
            cjs.dic.get('dataEventHolderProxy').eachHandler(function(scope, handler)
            {
                if (!['mygames', 'default', 'temporary'].includes(scope))
                {
                    return;
                }
                handler.resetIds();
            });
            cjs.dic.get('dataLeagueHolderProxy').eachHandler(function(scope, handler)
            {
                if (!['mygames', 'default', 'temporary'].includes(scope))
                {
                    return;
                }
                handler.resetIds();
            });
        }
        fs_counter = {};
        fsEventsUpdatedStartTime = {};
    };
// }}}

    /**
 * init environment
    * @param    string    sport_name                    name of desired sport
    * @param    string    [country_id = null]            id of desired country (from left menu)
    * @param    string    [tournament_id = null]            id of desired tournament (from left menu)
    * @param    bool    [country_order_fin = true]    order set to finished games
    */
    function init({
                      sportId,
                      sport_name,
                      country_id,
                      tournament_id,
                      country_tournament_order_fin,
                      prev_category,
                      prev_date,
                      startUpdater,
                      participant_id,
                      seriesId,
                      pushEnabled = true,
                  }) {
        if(typeof startUpdater == 'undefined')
        {
            startUpdater = true;
        }

        var utilPage = cjs.dic.get("util_page");

        // XXX Hack to partial work
        if (utilPage.isMixed())
        {
            sport_name = 'soccer';
        }

        if (dof = clientStorage.get('fs_of_' + cjs.Api.config.get('app', 'lang', 'web'))) {
            default_odds_format = dof;
        }

        ajax_updater = 'update';

        if (pushEnabled) {
            initPush();
        }

        var currentTimestamp = cjs.dic.get("util_date").getTimestamp();
        refresh_utime = currentTimestamp;

        if (typeof SPORT_LIST[sport_name] == 'undefined')
        {
            return false;
        }

        if (typeof country_id == 'undefined' || country_id == 0)
        {
            country_id = null;
        }

        if (typeof tournament_id == 'undefined' || tournament_id == 0)
        {
            tournament_id = null;
        }

        if (typeof participant_id == 'undefined' || participant_id == 0)
        {
            participant_id = null;
        }

        if (typeof seriesId == 'undefined' || seriesId == 0)
        {
            seriesId = null;
        }

        if (typeof country_tournament_order_fin == 'undefined')
        {
            country_tournament_order_fin = true;
        }

        sport_id = sportId;
        sport = sport_name;
        country = country_id;
        utilPage.setCountryId(country_id || 0);
        tournament = tournament_id;
        participant = participant_id;
        utilPage.setParticipantEncodedId(participant_id || '');
        series = seriesId;
        utilPage.setSeriesEncodedId(seriesId || '');
        utilPage.setFullPage(true);
        tournamentPage = tournament != null;
        utilPage.setTournamentPage(tournamentPage);
        utilPage.setTournamentId(tournament_id);

        initCategory(prev_category);

        // set date
        initDate(prev_date);

        initFeedRequest();
        initLsLoginClient();
        initMyGames();

        // ajax sync
        updater = new CommCore(country, tournament, country_tournament_order_fin, participant, series);
        cjs.fromGlobalScope.updater = updater;

        initUpdatingMatches(country, startUpdater);
        initTooltip();

        cjs.Api.loader.get('tv/transactions').call();
    };

    cjs.fromGlobalScope.init = init;

    function initTooltip()
    {
        if (tt == null) {
            tt = new Tooltip();
        }

        var tooltipElement = document.getElementById("tooltip-1");
        if (tooltipElement) {
            tooltipElement.addEventListener("mouseleave", function (e) {
                cjs.dic.get("util_enviroment").getTooltipObject().hide(e.target);
            });
        }
    }

    cjs.fromGlobalScope.initTooltip = initTooltip;

    function initPush(fallback)
    {
        if (typeof cjs.push === 'undefined')
        {
            var pushParameters = {
                "domain": 'fsdatacentre.com',
                "aliases": 'p1tt2:100, p2tt2:100, p3tt2:100, p4tt2:100, p5tt2:100, p6tt2:100, p7tt2:100, p8tt2:100, p9tt2:100, p10tt2:100',
                "port": 443,
                "migPush": new PushClient,
                "namespace": '/fs/fs3_',
                "projectId": 35,
                "jsxCompressor": JXG,
                "fallbackMethod": fallback || push_fallback,
                "fallbackDelay": cjs.Api.ajaxSyncTime.getTime('update'),
                "enabled": mpe_delivery == 'p',
            };

            cjs.Api.loader.get('synchronizationPush').call(pushParameters, function(module) {
                cjs.push = module;
            });
        }
    };

    cjs.fromGlobalScope.initPush = initPush;

    function initStaticPagesGamesNotification()
    {
                initLsLoginClient();
        cjs.disableRedrawUserSettings = true;
        
        if (cjs.Api.config.get('app', 'game_notification_push' ,'enable'))
        {
            cjs.gamesNotificationOnly = true;
            initPush(function() {});
            cjs.Api.loader.get('synchronizationPushInstance').call(function(_push) {
                _push.enable(true);
                push_connect();
                initMyGames();
                push_update_subscription();
            });
        }
        else
        {
            cjs.isStaticPage = true;
        }
    }

    cjs.fromGlobalScope.initStaticPagesGamesNotification = initStaticPagesGamesNotification;

    function initUpdatingMatches(country, startUpdater)
    {
        if (startUpdater)
        {
            updater.is_updater_started = true;

            var param = 'full';

            if (country === null)
            {
                param = 'full';
            }
            else if (participant !== null)
            {
                param = 'participant';
                // TODO back compatibility for sports not included in FSWEB-12635 (Team page with new data structure)
                if ((cjs.Api.config.get('app', 'team_page' ,'duel') || []).includes(sport_id)) {
                    return; // TODO not downloading initial feed for team page
                }
            }
            else if (series !== null)
            {
                param = 'series';
            }
            else if (tournament !== null)
            {
                param = 'tournament';
            }
            else if (country !== null)
            {
                param = 'country';
            }

            setupInitialLoading(param);

            if (param === 'full')
            {
                updater.doc_update('full');
            }
            else
            {
                setTimeout(function() {
                    updater.doc_update(param);
                }, 10);
            }
        }
        else
        {
            try
            {
                document.displayTrustedAdvert();
            }
            catch(e) { }
        }
    };

    function initDate(previousDate)
    {
        var prev_date = parseInt(previousDate);
        if (!isNaN(prev_date))
            sudate = prev_date;
        else
        {
            prev_date = clientStorage.get('fs_date', 'parent');
            if (null !== prev_date) {
                prev_date = parseInt(prev_date);
                if (!isNaN(prev_date)) {
                    sudate = prev_date;
                }
                clientStorage.drop('fs_date');
            }
        }
    };

    function initCategory(previousCategory)
    {

        var prev_category = parseInt(previousCategory);
        if (!isNaN(prev_category))
        {
            category = prev_category;
        }
        else
        {
            var window_location = new String(window.location);
            if(window_location.match(/cat=/))
            {
                var pos = window_location.indexOf('cat=');
                prev_category = window_location.substr(pos + 4, 1);

                prev_category = cjs.dic.get('util_number').toNumber(prev_category);
                category = prev_category;
            }
        }
    };

    function initMyGames()
    {
        if (typeof cjs.mygames === 'undefined')
        {
            cjs.mygames = cjs.dic.get("MyGamesFactory").create({
                storage: clientStorage,
                lsid: cjs.dic.get('MyGamesClientFactory').create(),
                sportList: SPORT_LIST_BY_ID,
                dayGetter: function(){ return sudate; },
                getMatchDayFunc: function(startTime, endTime) { return cjs.dic.get('utilDate').getMatchDay(startTime, endTime); },
                projectId: project_id,
                getGmtOffsetFunc: cjs.Api.timezone.getGmtOffset.bind(cjs.Api.timezone),
                eventsUpdatedStartTimeGetter: function(){ return fsEventsUpdatedStartTime; },
                dic: cjs.dic,
                categoryGetter: function(){ return category; },
                sortFsData: function() { sort_fs_data(); },
                pushUpdateSubscription: function() { push_update_subscription(); },
                translate: cjs.dic.get('utilTrans'),
            });

            cjs.Api.loader.get('myGames').fulfill(function(callback) {
                callback(cjs.mygames);
            });
        }
    };

    cjs.fromGlobalScope.initMyGames = initMyGames;

    function initLsLoginClient()
    {
                lsid_init();
        cjs.liveTableSettings = cjs.dic.get("LiveTable_Settings");
        cjs.liveTableSettings.init(
            function(){ return cjs.disableRedrawUserSettings },
            function(){ return category },
            sort_fs_data
        );
        if (sport_id !== null) {
            my_leagues_init(sport_id);
        }

        var reloadMyGamesTab = function() {
            if (cjs.dic.get('Helper_MyGamesChecker').isMyGames() && !cjs.Api.config.get("app", "myfs", "enabled")) {
                cjs.Api.loader.get("myTeams").call(function(_mt) {
                    if (_mt.getCount()) {
                        _mt.reloadAllParticipants();
                    } else {
                        loadAndShowMygamesContent();
                        _mt.callReactUpdates();
                    }
                });
            } else {
                cjs.Api.loader.get('reactCalls').call(function(reactCalls) {
                    reactCalls.reloadMyGamesTabCounter();
                });
            }
        };

        cjs.Api.loader.get("loggedInObservable").call((observable) => {
            observable.subscribe((loggedIn) => {
                if(loggedIn) {
                    cjs.mygames.load();
                    cjs.liveTableSettings.loadUserSettings();
                    redrawLivescore();
                    reloadMyGamesTab();
                    push_update_subscription();
                    const seoTop = document.querySelectorAll(".seoTop");
                    seoTop.forEach((elem) => {
                        elem.style.display = "none";
                        elem.classList.add("seoTopHidden");
                    });
                    document.body.classList.add('isLoggedIn');
                    document.body.classList.remove('seoTopWrapperHidden');
                } else {
                    cjs.mygames.drop();
                    cjs.liveTableSettings.restoreDefaults();
                    redrawLivescore();
                    reloadMyGamesTab();
                    push_update_subscription();
                }
            });
        });
        const lsidClient = cjs.dic.get('lsidClientFactory').getInstance();
        lsidClient.storage.getInnerDataObservable(["myLeagues"]).subscribe(redrawLivescore);
        lsidClient.storage.getInnerDataObservable(["mygames"]).subscribe(function()
        {
            cjs.mygames.load();
            redrawLivescore();
            reloadMyGamesTab();
        });
        lsidClient.storage.getInnerDataObservable(["lsSettins"]).subscribe(function()
        {
            cjs.liveTableSettings.loadUserSettings();
            redrawLivescore();
        });
            };

    function initFeedRequest()
    {
        if (typeof(cjs.feedRequest) !== 'undefined')
        {
            return;
        }

        cjs.feedRequest = cjs.dic.getNewInstance("Feed_Request");
        cjs.feedLoader = cjs.dic.getNewInstance("Feed_Loader");
    };

    cjs.fromGlobalScope.initFeedRequest = initFeedRequest;

    function redrawLivescore()
    {
        var isTournamentPage = cjs.dic.get('util_page').isTournamentPage();
        if (cjs.redrawLivescoreCalled || (!cjs.full_loaded && !isTournamentPage))
        {
            return;
        }
        cjs.redrawLivescoreCalled = true;
        setTimeout(function()
        {
            delete(cjs.redrawLivescoreCalled);
            cjs.liveTableSettings.redrawLivescore(true);
            cjs.Api.loader.get('reactCalls').call(function(reactCalls) {
                reactCalls.reloadStaticContent();
            });
        }, 100);
    };

    function init_after_feeds()
    {
        if(!cjs.full_loaded || !cjs.repair_loaded)
            return;

        // update counter
        if (counter_update_interval === null)
        {
            counter_update_interval = setInterval('counter_update()', 5 * 1000);
        }

        set_service_status();
    };

    function start_updating_odds()
    {
        if(typeof updater.updating_odds_interval != 'undefined')
            stop_updating_odds();
        updater.updating_odds_interval = setInterval('updater.doc_update(\'updated-odds\')', cjs.Api.config.get('ajax', 'prematch_odds_sync_time') * 1000);
    };

    function stop_updating_odds()
    {
        clearInterval(updater.updating_odds_interval);
        delete updater.updating_odds_interval;
    };

    function setHolderProxyScope(category, defaultScope, myGamesScope)
    {
        var scope;
        var holderEventProxy = cjs.dic.get('dataEventHolderProxy');
        var holderLeagueProxy = cjs.dic.get('dataLeagueHolderProxy');
        var previousScopeEvent = holderEventProxy.getScope();
        var previousScopeLeague = holderLeagueProxy.getScope();
        var dataEventHolderOld, dataEventHolderNew, dataLeagueHolderOld, dataLeagueHolderNew;

        switch(category)
        {
            case 5:
                scope = myGamesScope;
                break;
            default:
                scope = defaultScope;
        }

        if (previousScopeEvent !== scope)
        {
            if (sudate == 0 && previousScopeEvent === previousScopeLeague && previousScopeEvent === defaultScope && scope === myGamesScope)
            {
                dataEventHolderOld = cjs.dic.get('dataEventHolder');
                dataEventHolderNew = cjs.dic.get('dataEventHolderMygames');
                dataLeagueHolderOld = cjs.dic.get('dataLeagueHolder');
                dataLeagueHolderNew = cjs.dic.get('dataLeagueHolderMygames');
                dataEventHolderNew.reinit(dataEventHolderOld.getReferences());
                dataLeagueHolderNew.reinit(dataLeagueHolderOld.getReferences());
                holderEventProxy.setScope(scope);
                holderLeagueProxy.setScope(scope);
                holderEventProxy.getHandler().resetIds();
                holderLeagueProxy.getHandler().resetIds();
            }
            else if (sudate == 0 && previousScopeEvent === previousScopeLeague && previousScopeEvent === myGamesScope && scope === defaultScope)
            {
                holderEventProxy.getHolder().reinit();
                holderLeagueProxy.getHolder().reinit();
                holderEventProxy.getHandler().resetIds();
                holderLeagueProxy.getHandler().resetIds();
                holderEventProxy.setScope(scope);
                holderLeagueProxy.setScope(scope);
            }
            else
            {
                holderEventProxy.getHolder().reinit();
                holderLeagueProxy.getHolder().reinit();
                holderEventProxy.getHandler().resetIds();
                holderLeagueProxy.getHandler().resetIds();
                holderEventProxy.setScope(scope);
                holderLeagueProxy.setScope(scope);
                holderEventProxy.getHolder().reinit();
                holderLeagueProxy.getHolder().reinit();
                holderEventProxy.getHandler().resetIds();
                holderLeagueProxy.getHandler().resetIds();
            }
        }
    };

    function updateNonMyGamesTabs()
    {
        if (updater.last_doc_update_category == 5)
        {
            if (cjs.dic.get('dataEventHolderProxy').getHolder().hasData())
            {
                sort_fs_data();
                updater.last_doc_update_category = category;
            }
            else
            {
                updater.last_doc_update_category = category;
                cjs.Api.loader.get('reactCalls').call(function(reactCalls) {
                    reactCalls.reloadDay(0);
                });
            }
        }

        return true;
    };

    function display_banners()
    {
        cjs.Api.loader.get("geoIpResolver").call(function(){
            cjs.Api.loader.get("onetrust").call(() => {
                cjs.Api.loader.get('boxContentManager').call(function(boxContentManager) {
                    boxContentManager.show(cjs.geoIP, cjs.geoIPIsoSubdivisionCode0, ["over_self_promo", "under"], cjs.Api.config.get('app', 'legal_age_confirmation', 'enabled'), cjs.Api.config.get('app', 'legal_age_confirmation', 'geoip'));
                });
            });
        });
    };

    function oddsActionsAfterContentGenerated(isOdds)
    {
        if (isOdds)
        {
            push_update_subscription(); // hack - tohle neni udelane jeste ciste
            cjs.Api.loader.get('reactCalls').call(function(reactCalls) {
                reactCalls.loadingState("odds", false);
                reactCalls.fullOddsFeedLoaded();
            });

            // regenerate live sync
            if(interval_live != null)
            {
                clearInterval(interval_live);
                interval_live = null;
            }
        }
    }

    function pgenerate_odds()
    {
        setTimeout('updater.doc_update(\'odds\', true)', 100);
    };

    cjs.fromGlobalScope.detail_open = function (_id, _tab, _checkHolder) {
        cjs.Api.loader.get('detail/opener').call({ eventId: _id, tabName: _tab, checkHolder: _checkHolder, isNoDuel: false })
    };

    function bookmaker_open(link, bookmakerId, betslip)
    {
        let url;
        try {
            url = new URL(link, window.location.origin);
        } catch (e) {
            // console.error(e, url);
            return;
        }

        if (!url.searchParams.has('gicc') || !url.searchParams.has('gisc')) {
            url.searchParams.set('gicc', cjs.geoIP);
            url.searchParams.set('gisc', cjs.geoIPIsoSubdivisionCode0);
        }

        if (betslip)
        {
            var width = 0;
            var height = 0;
            cjs.Api.loader.get('bookmakerSettings').call(function(module) {
                var betslipWindow = module.getBetslipWindow(bookmakerId);
                width = betslipWindow.getWidth();
                height = betslipWindow.getHeight();
            });

            var params = '';
            if (width && height)
            {
                params = 'hotkeys=no, resizable=no, toolbar=no, status=no, dependent=yes, scrollbars=1, width=' + width + ', height=' + height;
            }
            var detail_window = window.open(url, "betslip", params);
            if (!detail_window.closed)
            {
                detail_window.focus();
            }
        }
        else
        {
            window.open(link);
        }
    };

    function reload(force_reload)
    {
        if (force_reload || true)
        {
            var url, message = "reload:" + sudate + "-" + category;
            var matches = /^([^#]+)#(.*)\breload:([0-9]+\-[0-9])(.*)$/.exec(parent.location.href);
            if (matches)
                url = matches[1] + "#" + matches[2] + message + (matches[4].length ? ";" + matches[4] : "");
            else
            {
                matches = /^([^#]+)#(.*)$/.exec(parent.location.href);
                if (matches)
                    url = matches[1] + "#" + (matches[2].length ? matches[2] + ";" : "") + message;
                else
                    url = parent.location.href + "#" + message;
            }
            parent.location.href = url;
            parent.location.reload();
        }
        else
            updater.doc_resume();
    };

    /**
 * Correct play time of matches
    */
    function counter_update()
    {
        var eventHandler = cjs.dic.get('dataEventHolderProxy').getHandler();
        var eventHolder = cjs.dic.get('dataEventHolderProxy').getHolder();
        var currentTimestamp = cjs.dic.get("util_date").getTimestamp();
        var reloadEvents = {};

        eventHandler.each(function(index, id)
        {
            var eventItem = this.getItem(id);
            var periodUpdateUTime = eventItem.getValue(feedIndexes.UPDATEINDEXES_PERIOD_UPDATE_UTIME);

            cjs.Api.loader.get('reactCalls').call(function(reactCalls) {
                reactCalls.reloadEvent(id);
            });

            if (typeof fs_counter[id] === "undefined"
                && periodUpdateUTime > 0
                && periodUpdateUTime > (currentTimestamp - counter_duration_time)
                && !eventItem.isScheduled())
            {
                fs_counter[id] = periodUpdateUTime;
                reloadEvents[id] = 1;
            }
        });

        for (var fsDataIndex in fs_counter)
        {
            if (fs_counter[fsDataIndex] < currentTimestamp - counter_duration_time)
            {
                if (eventHolder.hasItem(fsDataIndex))
                {
                    eventHolder.getItem(fsDataIndex).setValue(feedIndexes.UPDATEINDEXES_PERIOD_UPDATE_UTIME, 0);
                    reloadEvents[fsDataIndex] = 1;
                }
                delete fs_counter[fsDataIndex];
            }
        }

        cjs.Api.loader.get('reactCalls').call(function(reactCalls) {
            for (var reloadEventId in reloadEvents)
            {
                reactCalls.reloadEvent(reloadEventId);
            }
        });
    };

    function set_calendar_date(value, forceReload)
    {
        if (!forceReload && value == sudate) return;
        sudate = cjs.dic.get('util_number').toNumber(value);

        if (hasRepairFeed(value))
        {
            delete cjs.gamesNotificationOnly;
        }
        else
        {
            cjs.gamesNotificationOnly = true;
        }

        push_update_subscription();
        push_connect(sudate);

        setTimeout(function () {
            updater.doc_update();
        }, 10);
    };

    /**
     * Opens window showing standings or draw for tournament stage.
     */
    function stats_open(tournament_id, tournament_stage_id, sport_id, stats_type_ident)
    {
        cjs.Api.loader.get('util/stats/opener').call({tournamentId: tournament_id, tournamentStageId: tournament_stage_id, sportId: sport_id, statsTypeIdent: parseInt(stats_type_ident) || 0});
    };

    function setAjaxSyncMultiplier(multiplier)
    {
        if (cjs.Api.ajaxSyncTime.getMultiplier() !== multiplier) {
            updater.ajax_time_update = true;
        }

        cjs.Api.ajaxSyncTime.setMultiplier(multiplier);
    };

    function set_service_status(value)
    {
        if(typeof value == 'undefined')
            value = service_status;

        value = parseInt(value, 10);
        cjs.Api.loader.get('Helper_ServiceStatusBox').call(value)
        service_status = value;
    };


// CommCore server communication routines {{{

    // CommCore init {{{

    /**
     * Constructor of the CommCore object.
     *
     * @param integer time    Interval for check updates
     * @param string func    Function to call
     * @return object
     */
    function CommCore(country_id, tournament_id, country_tournament_order_fin, participant_id, seriesId)
    {
        var currentTimestamp = cjs.dic.get("util_date").getTimestamp();
        this.interval_sync    = null;
        this.interval_blink = null;
        this.interval_counter = null;
        this.interval_live = null;
        this.last_sync_utime = currentTimestamp;
        this.refresh_utime = currentTimestamp;
        this.last_doc_update_category = null;
        this.last_doc_update_action = null;
        this.parse_only = false;
        this.ajax_time_update = false;

        this.country_id = country_id;
        this.tournament_id = tournament_id;
        this.country_tournament_order_fin = (country_tournament_order_fin ? true : false);

        if (tournament_id != null)
        {
            this.init_action = 'tournament';
        }
        else if (typeof participant_id != 'undefined' && participant_id != null)
        {
            this.init_action = 'participant';
        }
        else if (typeof seriesId != 'undefined' && seriesId != null)
        {
            this.init_action = 'series';
        }
        else if (country_id != null)
        {
            this.init_action = 'country';
        }
        else
        {
            this.init_action = 'full';
        }

        this.game  = null;
        this.content_utime = null;
    };
    // }}}

    /**
     * Resume AJAX update after long failure - this is a workaround for frepair feed which is called but no update feed is started afterwards
     */
    CommCore.prototype.doc_resume = function(forceUpdate)
    {
        if (forceUpdate || !cjs.dic.get('Helper_MyGamesChecker').isMyGames())
        {
            updater.doc_update();
            updater.set_interval('update');
        }
        else
        {
            loadAndShowMygamesContent();
        }
    };

    CommCore.prototype.lastSyncUtimeIsTooOld = function(currentTimestamp, useOddsCacheTime)
    {
        currentTimestamp = currentTimestamp || cjs.dic.get("util_date").getTimestamp();
        var cacheTime = useOddsCacheTime ? cjs.Api.config.get('ajax', 'prematch_odds_cache_time') : cjs.Api.config.get('ajax', 'sql_cache_time');
        return !this.ajax_time_update && (this.last_sync_utime + (0.8 * cacheTime) < currentTimestamp);
    };

    CommCore.prototype.lastSyncUtimeCanBeHandledByRepairFeed = function(currentTimestamp)
    {
        currentTimestamp = currentTimestamp || cjs.dic.get("util_date").getTimestamp();
        return this.last_sync_utime + (0.8 * 300) > currentTimestamp;
    };

    function referenceSameIdsInHolders(holder1, holder2)
    {
        var id, ids = holder1.getAllContainerIds();
        for (var i = 0, _len = ids.length; i < _len; i++ )
        {
            id = ids[i];
            if (holder2.hasItem(id))
            {
                holder2.setItem(id, holder1.getItem(id));
            }
        }
    };

    // CommCore request functions {{{
    CommCore.prototype.doc_update = function(action, get_odds, prefered_sport_id, pageNumber, type, responseCallback)
    {
        if (category == 5 && (action == 'update' || action == 'repair' || action == 'frepair'))
        {
            var neededFeeds = [];
            neededFeeds = neededFeeds.concat(cjs.mygames.getNeededFeeds(1));

            if (neededFeeds.length > 0)
            {
                for (var i in neededFeeds)
                {
                    if (sport_id == neededFeeds[i].sport_id)
                    {
                        continue;
                    }

                    prefered_sport_id = 0;
                    break;
                }
            }

            if (typeof cjs.myTeams != 'undefined')
            {
                var sports = cjs.myTeams.getSportIds();
                if (sports.length > 1 || (sports.length == 1 && sports[0] != prefered_sport_id))
                {
                    prefered_sport_id = 0;
                }
            }
        }

        action = (typeof action == 'undefined' ? updater.init_action : action);

        prefered_sport_id = (typeof prefered_sport_id == 'undefined') ? sport_id : prefered_sport_id;

        // sys - out of sync update
        if(action == 'sys' && ((sudate != 0 && sudate != -1)))
            return;

        // update - out of sync
        if(action == 'update' && (sudate != 0 && sudate != -1))
            return;

        this.last_doc_update_category = category;
        this.last_doc_update_action = action;

        switch (action)
        {
            case 'full':
            case 'country':
            case 'tournament':
                if (tournamentPage === false && ['country', 'tournament'].includes(action))
                {
                    var eventHolder = cjs.dic.get('dataEventHolder');
                    var leagueHolder = cjs.dic.get('dataLeagueHolder');
                    var completeEventsHolder = cjs.dic.get('dataEventHolderTemporary');
                    var completeLeaguesHolder = cjs.dic.get('dataLeagueHolderTemporary');
                    var filteredEventsHolder = cjs.dic.get('dataEventHolderFiltered');
                    var filteredLeaguesHolder = cjs.dic.get('dataLeagueHolderFiltered');
                    var isCountryTabDefault = category === 0;
                    var isCountryTabFinished = category === 6;
                    var isCountryTabScheduled = category === 7;
                    var afterCallback = function(){
                        cjs.Api.loader.get('reactCalls').call(function(reactCalls) {
                            reactCalls.loadingState("country", false);
                        });
                    };
                    var myGamesCallback = function(){};

                    function filterExistingEventsData(eventHolder, leagueHolder, filteredEventHolder, filteredLeaguesHolder)
                    {
                        eventHolder.reinit(filteredEventHolder.getReferences());
                        leagueHolder.reinit(filteredLeaguesHolder.getReferences());
                        cjs.dic.get('dataEventHandler').resetIds();
                        cjs.dic.get('dataLeagueHandler').resetIds();
                    }

                    if (isCountryTabDefault || (isCountryTabFinished && !completeEventsHolder.hasData()))
                    {
                        afterCallback = function()
                        {
                            completeEventsHolder.reinit(eventHolder.getReferences());
                            completeLeaguesHolder.reinit(leagueHolder.getReferences());
                            myGamesCallback();
                            cjs.Api.loader.get('reactCalls').call(function(reactCalls) {
                                reactCalls.loadingState("country", false);
                            });
                        };
                    }
                    else if (eventHolder.hasData())
                    {
                        if (isCountryTabFinished && completeEventsHolder.hasData())
                        {
                            filterExistingEventsData(eventHolder, leagueHolder, completeEventsHolder, completeLeaguesHolder);
                            updater.generate_data();
                            break;
                        }
                        else if (isCountryTabScheduled && !filteredEventsHolder.hasData())
                        {
                            afterCallback = function()
                            {
                                filteredEventsHolder.reinit(eventHolder.getReferences());
                                filteredLeaguesHolder.reinit(leagueHolder.getReferences());
                                myGamesCallback();
                                cjs.Api.loader.get('reactCalls').call(function(reactCalls) {
                                    reactCalls.loadingState("country", false);
                                });
                            };
                        }
                        else if (isCountryTabScheduled && filteredEventsHolder.hasData())
                        {
                            filterExistingEventsData(eventHolder, leagueHolder, filteredEventsHolder, filteredLeaguesHolder);
                            updater.generate_data();
                            break;
                        }
                    }
                }

                const disableFeedExecution = [
                    action === "full" && (cjs.Api.config.get("app", "sport_page", "duel") || []).includes(sport_id),
                    action === "tournament" && (cjs.Api.config.get("app", "tournament_page", "duel") || []).includes(sport_id),
                ];

                // Run only on legacy pages, in new SPA pages feed execution is triggered in react
                if(!disableFeedExecution.some(Boolean)) {
                    resetAndExecuteFeedRequests(prefered_sport_id, action, afterCallback);
                }
                break;

            case 'tournament-fixtures':
            case 'tournament-results':
                var seasonId = 0;
                var initialFeedData = cjs.initialFeeds[action === 'tournament-fixtures' ? 'fixtures' : 'results'];
                if (initialFeedData) {
                    seasonId = initialFeedData.seasonId || 0;
                }

                tournamentPageDataPart++;
                cjs.feedRequest.execute(action, prefered_sport_id, responseCallback, {
                    seasonId: seasonId,
                    dataPart: tournamentPageDataPart
                });
                break;

            case 'participant':
                // TODO back compatibility for sports not included in FSWEB-12635 (Team page with new data structure)
                if (!(cjs.Api.config.get('app', 'team_page' ,'duel') || []).includes(sport_id)) {
                    cjs.feedRequest.execute(action, prefered_sport_id, responseCallback, {participantId: participant});
                }
                break;

            case 'series':
                cjs.feedRequest.execute(action, prefered_sport_id, responseCallback, {seriesId: series});
                break;

            case 'participant-odds':
                cjs.feedRequest.execute(action, prefered_sport_id, responseCallback, {participantId: participant});
                break;

            case 'participant-fixtures':
            case 'participant-fixtures_s':
            case 'participant-fixtures_d':
            case 'participant-fixtures_m':
            case 'participant-results':
            case 'participant-results_s':
            case 'participant-results_d':
            case 'participant-results_m':
                cjs.participantPageNumber = cjs.participantPageNumber || 0;
                var tennisTypeArr = action.match(/_[sdm]$/);
                var tennisType = tennisTypeArr && tennisTypeArr[0] ? tennisTypeArr[0] : '';
                cjs.feedRequest.execute(action.split('_')[0], prefered_sport_id, responseCallback, {
                        participantId: participant,
                        dataPart: ++cjs.participantPageNumber,
                        tennisType: tennisType || ''
                });
                break;

            case 'participant-newsfeed':
                var ret = cjs.feedRequest.execute(action, prefered_sport_id, responseCallback, {
                    participantId: participant,
                    pageNumber: pageNumber,
                    type: type,
                    callback: responseCallback
                });
                if (ret === false)
                {
                    return;
                }
                break;

            default:
                if (action == 'odds')
                {
                    cjs.Api.loader.get('reactCalls').call(function(reactCalls) {
                        reactCalls.loadingState("odds-calendar", false);
                        reactCalls.loadingState("odds", true);
                    });
                }
                var ret = cjs.feedRequest.execute(action, prefered_sport_id, responseCallback);
                if (ret === false)
                {
                    return;
                }
        }
    };

    function get_odds_format()
    {
        if(typeof odds_format_url != 'undefined' && typeof ODDS_FORMAT_LIST[odds_format_url] != 'undefined')
        {
            prefered_format = odds_format_url;
            default_odds_format = prefered_format;
        }
        else
        {
            if (['_ass'].includes(project_type_name))
            {
                var prefered_format = clientStorage.get('fs_of');
            }
            else
            {
                var prefered_format = clientStorage.get('fs_of_' + cjs.Api.config.get('app', 'lang', 'web'));
            }

            if(typeof ODDS_FORMAT_LIST[prefered_format] == 'undefined')
                prefered_format = default_odds_format;
            else
                default_odds_format = prefered_format;
        }

        return prefered_format;
    };
    // }}}

    // CommCore response functions {{{
    CommCore.prototype.response_full = function(r_status, r_headers, r_content, r_trigger, r_custom_headers)
    {
        CommCore.parse_custom_headers(r_custom_headers);

        if(r_trigger == 'headers_hit')
            return;

        cjs.full_loaded = true;

        var mainBookmakerIds = [];
        cjs.Api.loader.get('bookmakerSettings').call(function (module) {
            mainBookmakerIds = module.getMainBookmakerIds(cjs.geoIP, cjs.geoIPIsoSubdivisionCode0);
            cjs.dic.get('Application').setMainBookmakerIds(mainBookmakerIds);
        });

        updater.setLastSyncUtime(cjs.dic.get("util_date").getTimestamp());
        if(updater.is_actual(r_status, r_headers)) { return; }

        if(!updater.parse_only)
        {
            if (tournamentPage === false && ['country', 'tournament'].includes(r_trigger) && cjs.dic.get('dataEventHolderTemporary').hasData())
            {
                cjs.dic.get('dataEventHolder').reinit();
                cjs.dic.get('dataEventHandler').resetIds();
                cjs.dic.get('dataLeagueHolder').reinit();
                cjs.dic.get('dataLeagueHandler').resetIds();
            }
            else
            {
                reset_env();
            }
        }

        ff_data = r_content;

        parse(r_content);

        if (!updater.parse_only) {
            var page = cjs.dic.get('util_page');
            if (hasRepairFeed(sudate)) {
                var has_data = cjs.dic.get('dataEventHolderProxy').getHolder().hasData();

                if (has_data) {
                    if (r_trigger === 'full' || r_trigger === 'country' || r_trigger === 'tournament') {
                        var feedData = cjs.feedRequest.getFeedData('frepair', sport_id);
                        cjs.feedLoader.executeCompleteCallback(feedData.context);
                    } else {
                        updater.doc_update('frepair');
                    }
                } else {
                    if (cjs.Api.config.get('app', 'odds', 'sport_page') && (['_ass', '_ff', '_sw'].includes(project_type_name) || Number(window.localStorage.getItem("odds_sport_page"))) && !page.isParticipantPage() && !page.isSeriesPage()) {
                        updater.generate_data_odds();
                        updater.clear_interval('set_interval: odds');
                    } else {
                        updater.generate_data();
                        updater.clear_interval('set_interval: update');
                    }
                }

                if (has_data && r_trigger === 'full') {
                    cjs.dic.get('dataEventHolderProxy').getHandler().each(function(index, id) {
                        cjs.dic.get('UpdateManager').removeEventLiveStatus(id);
                    });
                }
            } else {
                sort_fs_data();
                if (cjs.Api.config.get('app', 'odds', 'sport_page') && (['_ass', '_ff', '_sw'].includes(project_type_name) || Number(window.localStorage.getItem("odds_sport_page"))) && !page.isParticipantPage() && !page.isSeriesPage()) {
                    updater.generate_data_odds();
                } else {
                    updater.generate_data();
                }
            }
        }
        init_after_feeds();
        if (tournamentPage === false && ['country', 'tournament'].includes(r_trigger) && cjs.dic.get('dataEventHolderTemporary').hasData())
        {
            var eventHolder = cjs.dic.get('dataEventHolder');
            var leagueHolder = cjs.dic.get('dataLeagueHolder');
            var temporaryEventHolder = cjs.dic.get('dataEventHolderTemporary');
            var temporaryLeagueHolder = cjs.dic.get('dataLeagueHolderTemporary');
            referenceSameIdsInHolders(eventHolder, temporaryEventHolder);
            referenceSameIdsInHolders(leagueHolder, temporaryLeagueHolder);
        }

        cjs.Api.loader.get('reactCalls').call(function(reactCalls) {
            if (cjs.dic.get('Helper_MyGamesChecker').isMyGames()) {
                reactCalls.loadingState("fullFeed", false);
            } else {
                reactCalls.fullFeedLoaded();
            }
        });
    };

    CommCore.prototype.response_update = function(r_status, r_headers, r_content, r_trigger, r_custom_headers)
    {
        if (typeof r_custom_headers != 'undefined' && typeof r_custom_headers['Date'] != 'undefined' && r_custom_headers['Date']) {
            var serverTime = new Date(r_custom_headers['Date']).getTime();
            if (!isNaN(serverTime)) {
                cjs.dic.get("util_date").setServerTimestamp(Math.floor(serverTime / 1000));
            }
        }
        var currentTimestamp = cjs.dic.get("util_date").getTimestamp();

        var isRepair = r_trigger == 'repair' || r_trigger == 'frepair';
        if (isRepair)
        {
            cjs.repair_loaded = true;
        }

        var resync = false;

        // check if time from the last sync is not too old. If so, repair data with the update feed
        if (updater.lastSyncUtimeIsTooOld(currentTimestamp))
        {
            // time from the last change can be handled by repair feed
            if (updater.lastSyncUtimeCanBeHandledByRepairFeed(currentTimestamp))
            {
                if (!isRepair)
                {
                    updater.set_interval('repair', true);
                    resync = true;
                }
            }
            // time from the last change is too old. Call initial (e.g. full) feed
            else
            {
                updater.doc_resume(true);
                resync = true;
            }
        }

        updater.setLastSyncUtime(currentTimestamp);

        cjs.Api.loader.get('util/midnightLiveTableRefresh').call(function(midnight) {
            midnight.disableReload();
        });

        if(resync)
            return;

        // resync, feed synchronization time changed
        if(updater.ajax_time_update && r_trigger != 'frepair')
        {
            updater.ajax_time_update = false;
            updater.set_interval('update');
        }

        // there is no data
        if(updater.is_actual(r_status, r_headers))
        {
            parse_status = true;
        }
        // there is new data
        else
        {
            // parse input data
            var parse_status = parse(r_content, true, false, r_trigger);
        }

        // regenerate the whole page with new data
        if(r_trigger == 'frepair')
        {
            sort_fs_data();
            if (cjs.Api.config.get('app', 'odds', 'sport_page') && (['_ass', '_ff', '_sw'].includes(project_type_name) || Number(window.localStorage.getItem("odds_sport_page")))) {
                updater.generate_data_odds();
            } else {
                updater.generate_data();
            }
            var sport_id = 1 * r_content.substring(3, r_content.indexOf(JS_CELL_END, 4));
            updater.sync_score_data_with_update(sport_id);
            if (cjs.dic.get("util_page").getPageType() === "series_page")
            {
                cjs.Api.loader.get('reactCalls').call(function(reactCalls) {
                    reactCalls.reloadTabContent(category);
                });
            }
        // just update existing content
        }
        else
            cjs.dic.get('UpdateManager').update(r_trigger);

        if(r_trigger == 'repair' || mpe_delivery == 'a' && r_trigger == 'frepair')
            updater.set_interval('update');

        if(!parse_status)
            refresh_iframe();

        if (r_trigger == 'frepair')
        {
            init_after_feeds();
        }
    };

    CommCore.prototype.response_odds = function(r_status, r_headers, r_content, r_trigger)
    {
        updater.setLastSyncUtime(cjs.dic.get("util_date").getTimestamp());
        if(updater.is_actual(r_status, r_headers)) { return; }
        var parse_status = parse(r_content, false, true);
        oddsActionsAfterContentGenerated(true);

        if (!parse_status)
            updater.set_interval(updater.init_action, true);
    };

    CommCore.prototype.response_updated_odds = function(r_status, r_headers, r_content, r_trigger)
    {
        var resync = false;
        var currentTimestamp = cjs.dic.get("util_date").getTimestamp();

        // check if time from the last sync is not too old. If so, repair odds with the update feed
        if(updater.lastSyncUtimeIsTooOld(currentTimestamp, true))
        {
            // time from the last change can be handled by repair feed
            if(updater.lastSyncUtimeCanBeHandledByRepairFeed(currentTimestamp))
            {
                if(r_trigger != 'repair' && r_trigger != 'frepair')
                {
                    updater.set_interval('repair', true);
                    resync = true;
                }
            }
            // time from the last change is too old. Call initial (e.g. full) feed
            else
            {
                updater.doc_resume(true);
                resync = true;
            }
        }

        updater.setLastSyncUtime(currentTimestamp);

        if(resync)
            return;

        // resync, feed synchronization time changed
        if(updater.ajax_time_update && r_trigger != 'frepair')
        {
            updater.ajax_time_update = false;
            updater.set_interval('update');
        }

        // there is no data
        if (updater.is_actual(r_status, r_headers)) {
            parse_status = true;
        }
        // there is new data
        else {
            // parse input data
            var parse_status = parse(r_content, true, false, r_trigger);
        }

        // regenerate the whole page with new data
        if (r_trigger == 'frepair') {
            var sport_id = parseInt(r_content.substring(3, r_content.indexOf(JS_CELL_END, 4)));

            if (['_ass', '_ff', '_sw'].includes(project_type_name)) {
                updater.generate_data();
            } else {
                oddsActionsAfterContentGenerated(true);
            }

            updater.sync_score_data_with_update(sport_id);
            // just update existing content
        } else
            cjs.dic.get('UpdateManager').update();

        if (!parse_status)
            refresh_iframe();
    };

    CommCore.prototype.response_load_odds = function(r_status, r_headers, r_content, r_trigger)
    {
        updater.setLastSyncUtime(cjs.dic.get("util_date").getTimestamp());
        if(updater.is_actual(r_status, r_headers)) { return; }

        var parse_status = parse(r_content, false, true);

        updater.generate_data();

        cjs.Api.loader.get('reactCalls').call(function(reactCalls) {
            reactCalls.loadingState("odds", false);
            reactCalls.fullOddsFeedLoaded();
        });

        if (!parse_status)
            updater.set_interval(updater.init_action, true);
    };

    CommCore.prototype.setLastSyncUtime = function(timestamp)
    {
        this.last_sync_utime = timestamp;
    };

    CommCore.expectedCacheKeys = {};

    CommCore.getExpectedNewCacheKey = function(key)
    {

        if (typeof CommCore.expectedCacheKeys[key] != 'undefined')
        {
            return CommCore.expectedCacheKeys[key];
        }

        return null;
    };

    CommCore.updateInProgress = {};

    CommCore.setUpdateInProgress = function(key,value)
    {
        CommCore.updateInProgress[key] = value;
    };

    CommCore.getUpdateInProgress = function(key)
    {
        if (typeof CommCore.updateInProgress[key] != 'undefined')
        {
            return CommCore.updateInProgress[key];
        }

        return null;
    };

    CommCore.parse_custom_headers = function(r_custom_headers)
    {
        if (typeof r_custom_headers == 'undefined')
        {
            return;
        }

        if (typeof r_custom_headers['X-Geoip2-Country-Code'] != 'undefined' && r_custom_headers['X-Geoip2-Country-Code'])
        {
            cjs.geoIP = r_custom_headers['X-Geoip2-Country-Code'];
        }

        if (typeof r_custom_headers['X-Geoip2-City-Name'] != 'undefined' && r_custom_headers['X-Geoip2-City-Name'])
        {
            cjs.geoIPCityName = r_custom_headers['X-Geoip2-City-Name'];
        }

        if (typeof r_custom_headers['X-Geoip2-Subdivision-Name-0'] != 'undefined' && r_custom_headers['X-Geoip2-Subdivision-Name-0'])
        {
            cjs.geoIPSubdivisionName0 = r_custom_headers['X-Geoip2-Subdivision-Name-0'];
        }

        if (typeof r_custom_headers['X-Geoip2-Subdivision-Code-0'] != 'undefined' && r_custom_headers['X-Geoip2-Subdivision-Code-0'])
        {
            cjs.geoIPSubdivisionCode0 = r_custom_headers['X-Geoip2-Subdivision-Code-0'];
        }

        if (typeof r_custom_headers['X-Geoip2-ISO-Subdivision-Code-0'] != 'undefined' && r_custom_headers['X-Geoip2-ISO-Subdivision-Code-0'])
        {
            cjs.geoIPIsoSubdivisionCode0 = r_custom_headers['X-Geoip2-ISO-Subdivision-Code-0'].replace('-', '');
        }

        if (typeof r_custom_headers['X-Geoip2-Subdivision-Name-1'] != 'undefined' && r_custom_headers['X-Geoip2-Subdivision-Name-1'])
        {
            cjs.geoIPSubdivisionName1 = r_custom_headers['X-Geoip2-Subdivision-Name-1'];
        }

        if (typeof r_custom_headers['Date'] != 'undefined' && r_custom_headers['Date'])
        {
            var serverTime = new Date(r_custom_headers['Date']).getTime();
            if (!isNaN(serverTime)) {
                cjs.dic.get("util_date").setServerTimestamp(Math.floor(serverTime / 1000));
            }

            if (!page_is_initialized)
            {
                page_utime_init_value(cjs.dic.get("util_date").getTimestamp());
            }
        }
    };

    CommCore.prototype.response_sys = function(r_status, r_headers, r_content, r_trigger, r_custom_headers)
    {
        (r_content.split(JS_CELL_END)).forEach((row) => {
            var keyAndValue = row.split(JS_INDEX);
            var key = keyAndValue[0] || "";
            var value = keyAndValue[1] || "";

            switch(key) {
                case 'mlp':
                    setAjaxSyncMultiplier(parseFloat(value));
                    break;
                case 'sst':
                    set_service_status(parseInt(value));
                    break;
                case 'stu': {
                    cjs.Api.ajaxSyncTime.setUpdateTime(parseInt(value));
                    updater.ajax_time_update = true;
                    break;
                }
                case 'utime':
                    cjs.dic.get("util_date").setServerTimestamp(parseInt(value));
                    break;
            }
        });
    };

    // CommCore service functions {{{
    CommCore.prototype.is_actual = function(r_status, r_headers_empty)
    {
        // no content, already have content
        if(r_status == 304 || r_status == 204 || r_status == 1223 || r_headers_empty === true)
            return true;
        return false;
    };

    CommCore.prototype.set_interval = function(action, useTimeout)
    {
        if (typeof useTimeout === 'undefined')
        {
            useTimeout = false;
        }

        var timerFunction = useTimeout ? setTimeout : setInterval;

        // clear previous interval
        updater.clear_interval('set_interval: ' + action);

        if(action == 'odds')
        {
            updater.interval_sync = timerFunction('updater.doc_update(\'odds\')', 100);
        }
        else
        {
            var ajaxTime = cjs.Api.ajaxSyncTime.getTime(action);
            updater.interval_sync = timerFunction('updater.doc_update(\'' + action + '\')', ajaxTime * 1000);
        }
    };

    CommCore.prototype.clear_interval = function(pom)
    {
        if(updater.interval_sync != null)
        {
            clearTimeout(updater.interval_sync);
            clearInterval(updater.interval_sync);
            updater.interval_sync = null;

            return true;
        }

        return false;
    };

    CommCore.prototype.generate_data_odds = function()
    {
        cjs.mygames.startStorageSyncTimer();

        if (category == 5)
        {
            start_updating_odds();
            return;
        }

        var page = cjs.dic.get('util_page');
        if (!page.isCountryPage() && !page.isSeasonPage())
        {
            if (cjs.Api.config.get('app', 'odds', 'sport_page') && (['_ass', '_ff', '_sw'].includes(project_type_name) || Number(window.localStorage.getItem("odds_sport_page")))) {
                start_updating_odds();
            }

            var param  = 'full-odds';
        }
        else
        {
            if (!page.isSeasonPage())
            {
                var param  = 'country-odds';
            }
            else
            {
                if (!page.isParticipantPage())
                {
                    var param = 'tournament-odds';
                }
                else
                {
                    var param = 'participant-odds';
                }
            }
        }
        updater.doc_update(param);
    };

    CommCore.prototype.generate_data = function()
    {
        cjs.mygames.startStorageSyncTimer();

        if (sub_category == 2 || sub_category == 3)
        {
            cjs.Api.loader.get('reactCalls').call(function(reactCalls) {
                reactCalls.loadingState("odds-calendar", true);
            });
            pgenerate_odds();
        }
    };

    /**
     * Synchronizes scores in global fs_data with core update.
     *
     * This method should be called after repair update and is
     * necessary for proper score highlighting when user browses
     * between several sports.
     *
     * @param {Number} sport_id sport indetifier to filter only
     * matches associated with that sport
     */
    CommCore.prototype.sync_score_data_with_update = function(sportId)
    {
        // list of known score field indentifiers
        var scores = [
            feedIndexes.SHAREDINDEXES_HOME_CURRENT_RESULT,
            feedIndexes.SHAREDINDEXES_AWAY_CURRENT_RESULT,
            feedIndexes.SHAREDINDEXES_HOME_RESULT_PERIOD_1,
            feedIndexes.SHAREDINDEXES_HOME_RESULT_PERIOD_2,
            feedIndexes.SHAREDINDEXES_HOME_RESULT_PERIOD_3,
            feedIndexes.SHAREDINDEXES_HOME_RESULT_PERIOD_4,
            feedIndexes.SHAREDINDEXES_HOME_RESULT_PERIOD_5,
            feedIndexes.SHAREDINDEXES_HOME_RESULT_PERIOD_6,
            feedIndexes.SHAREDINDEXES_HOME_RESULT_PERIOD_7,
            feedIndexes.SHAREDINDEXES_HOME_RESULT_PERIOD_8,
            feedIndexes.SHAREDINDEXES_HOME_RESULT_PERIOD_9,
            feedIndexes.FULLFEEDINDEXES_HOME_SCORE_PART_PESAPALLO_FIRST_HALF,
            feedIndexes.FULLFEEDINDEXES_HOME_SCORE_PART_PESAPALLO_SECOND_HALF,
            feedIndexes.FULLFEEDINDEXES_HOME_SCORE_PART_PESAPALLO_PENALTIES,
            feedIndexes.SHAREDINDEXES_HOME_MARTIAL_ARTS_FINISHED,
            feedIndexes.SHAREDINDEXES_HOME_MARTIAL_ARTS_FINISHED_ROUND,
            feedIndexes.SHAREDINDEXES_HOME_MARTIAL_ARTS_FINISHED_SUB,
            feedIndexes.SHAREDINDEXES_AWAY_RESULT_PERIOD_1,
            feedIndexes.SHAREDINDEXES_AWAY_RESULT_PERIOD_2,
            feedIndexes.SHAREDINDEXES_AWAY_RESULT_PERIOD_3,
            feedIndexes.SHAREDINDEXES_AWAY_RESULT_PERIOD_4,
            feedIndexes.SHAREDINDEXES_AWAY_RESULT_PERIOD_5,
            feedIndexes.SHAREDINDEXES_AWAY_RESULT_PERIOD_6,
            feedIndexes.SHAREDINDEXES_AWAY_RESULT_PERIOD_7,
            feedIndexes.SHAREDINDEXES_AWAY_RESULT_PERIOD_8,
            feedIndexes.SHAREDINDEXES_AWAY_RESULT_PERIOD_9,
            feedIndexes.FULLFEEDINDEXES_AWAY_SCORE_PART_PESAPALLO_FIRST_HALF,
            feedIndexes.FULLFEEDINDEXES_AWAY_SCORE_PART_PESAPALLO_SECOND_HALF,
            feedIndexes.FULLFEEDINDEXES_AWAY_SCORE_PART_PESAPALLO_PENALTIES,
            feedIndexes.SHAREDINDEXES_AWAY_MARTIAL_ARTS_FINISHED,
            feedIndexes.SHAREDINDEXES_AWAY_MARTIAL_ARTS_FINISHED_ROUND,
            feedIndexes.SHAREDINDEXES_AWAY_MARTIAL_ARTS_FINISHED_SUB
        ];

        var changesHistoryContainer = cjs.dic.get('ChangesHistoryContainer');
        cjs.dic.get('dataEventHolderProxy').getHandler().each(function(index, id)
        {
            var eventItem = this.getItem(id);
            var scorePos, scoreIndex, historyScore;
            if (eventItem.getSportId() != sportId)
            {
                return;
            }
            scorePos = scores.length;
            while(scorePos--)
            {
                scoreIndex = scores[scorePos];
                if (eventItem.getValue(scoreIndex) === null)
                {
                    continue;
                }

                historyScore = undefined;
                if (changesHistoryContainer.hasNewValue(id, scoreIndex))
                {
                    historyScore = changesHistoryContainer.getNewValue(id, scoreIndex);
                }

                changesHistoryContainer.setValueChange(id, scoreIndex, eventItem.getValue(scoreIndex), historyScore);
            }
        });

        changesHistoryContainer.removeNewData();
    };

    // }}}

// }}}

// pushserver {{{

    /**
     * Method for switching PUSH <-> AJAX (for debugging, we are now without small green square below liveTable)
     */
    function sync_change()
    {
        if (cjs.push)
        {
            if(cjs.push.isConnected())
            {
                push_disconnect();
                cjs.push.startFallback()
            }
            else
                push_connect();
        }
    };

    function push_init()
    {
        cjs.Api.loader.get("synchronizationPushInstance").call((sp) => {
            // hack - tohle neni udelane dobre a ceka az se predela cely updaterovaci mechanizmus nad ajaxem a pushem {{{
            if (cjs.dic.get('dataEventHolderProxy').getHolder().hasData() === false)
            {
                if (cjs.Api.config.get('app', 'game_notification_push' ,'enable'))
                {
                    cjs.gamesNotificationOnly = true;
                    push_connect();
                }
                else
                {
                    push_disconnect();
                }
            }
            if (!sp.isConnected()) {
                push_connect();
            }
            if (cjs.gamesNotificationOnly) {
                sp.stopScheduledFallback();
            }
        });
    };

    /**
 * Switch to a standard ajax syncing
     */
    function push_fallback(action, fail_msg)
    {
        if(typeof action == 'undefined' || (action != 'start' && action != 'stop'))
            action = 'start';

        if(action == 'start')
        {
            // TODO back compatibility for sports not included in FSWEB-12635 (Team page with new data structure)
            if (participant && (cjs.Api.config.get('app', 'team_page' ,'duel') || []).includes(sport_id)) {
                return; // TODO not periodically updating via update feed for team page
            }

            if (updater.interval_sync == null)
            {
                updater.set_interval('update');
            }

            updater.doc_update('sys'); // intentionally
            sys_interval_checker = setInterval('updater.doc_update(\'sys\')', 60 * 1000);
        }
        else
        {
            updater.clear_interval('push working, dissabling ajax');
            clearInterval(sys_interval_checker);
            push_connect();
        }
    };

    function push_connect()
    {
        if (cjs.dic.get('dataEventHolderProxy').getHolder().hasData() || typeof cjs.gamesNotificationOnly !== 'undefined')
        {
            if (cjs.push)
            {
                cjs.push.connect(sudate);
                push_update_subscription();
            }
        }
    };

    async function push_update_subscription()
    {
        if (cjs.push)
        {
            var subscription = [];
            const subjectComposer = cjs.dic.get("subjectNameComposer");

            if (typeof cjs.gamesNotificationOnly === 'undefined')
            {
                subscription.push(subjectComposer.getSysSubject()); // always required
                subscription.push(subjectComposer.getServiceSubject()); // always required

                var sportIds = [sport_id];
                if (cjs.dic.get('Helper_MyGamesChecker').isMyGames())
                {
                    sportIds = sportIds.concat(cjs.mygames.getSportIds());
                    if (cjs.myTeams)
                    {
                        sportIds = sportIds.concat(cjs.myTeams.getSportIds());
                    }
                }

                var uniqueSportIds = sportIds.filter(function(value, index, self) { return self.indexOf(value) == index; });
                for (var i in uniqueSportIds)
                {
                    var sportId = uniqueSportIds[i];
                    subscription.push(subjectComposer.getUpdateSubject(sportId));
                    subscription.push(subjectComposer.getUpdateLocalSubject(sportId));
                }
            }

            const accountManagement = await new Promise((resolve) => cjs.Api.loader.get("accountManagement").call(resolve))
            if (await accountManagement.isUserLoggedIn())
            {
                const profile = await accountManagement.getUser().getProfile();
                if (profile.id) {
                    subscription.push(subjectComposer.getLsidSubject(profile.id));
                }
            }

            if (cjs.Api.config.get('app', 'game_notification_push' ,'enable'))
            {
                var subscriptionInfo = {};
                if (typeof cjs.mygames !== 'undefined')
                {
                    if(!cjs.mygames.isLoaded()) cjs.mygames.load();
                    for (var index in cjs.mygames.getContainer())
                    {
                        subscription.push(subjectComposer.getGamesSubject(index.split('_')[2]));
                        subscriptionInfo[index.split('_')[2]] = {
                            sportId: index.split('_')[1],
                            timestamp: new Date().getTime()
                        };
                    }
                }
                cjs.push.setSubscriptionInfo(subscriptionInfo);
            }
            cjs.push.updateSubscription(subscription);
        }
    };

    cjs.fromGlobalScope.push_update_subscription = push_update_subscription;

    function push_disconnect()
    {
        if (cjs.push)
        {
            cjs.push.disconnect();
        }
    };

    function push_refresh()
    {
        if (hasRepairFeed(sudate))
        {
            delete cjs.gamesNotificationOnly;
        }

        push_connect();
        push_update_subscription();
    };

    function refresh_iframe()
    {
        setTimeout("updater.set_interval('" + updater.init_action + "', true)", (Math.random() * 60 + 20) * 1000);
    };

// }}}

function page_utime_init_value(currentTimestamp)
{
    refresh_utime = currentTimestamp;
    page_is_initialized = true;
    counter_update();

    if (updater)
    {
        updater.refresh_utime = currentTimestamp;
    }
};

function switch_odd_format(format)
{
    clientStorage.store('fs_of_' + cjs.Api.config.get('app', 'lang', 'web'), format, 365*86400, 'self', '/');
    default_odds_format = format;
}

//needed for jsonp callback (don`t remove)
function jsonp_cb()
{
};

function getSpreadTrans()
{
    var spreadTransArr = [];
    var utilTrans = cjs.dic.get('utilTrans');

    spreadTransArr['full'] = utilTrans.translate('TRANS_ODDS_COMPARISON_ASIAN_HANDICAP');
    spreadTransArr['short'] = utilTrans.translate('TRANS_ODDS_COMPARISON_ASIAN_HANDICAP_IFRAME_SHORT');

    
    return spreadTransArr;
};

function loadAndShowMygamesContent(downloadFeedsForMovedGames, downloadedFeedsInPrevCall, prevNeedRepair)
{
    var loadTodayFeed = false;
    var feedRequest;
    prevNeedRepair = !!prevNeedRepair;
    downloadFeedsForMovedGames = !!downloadFeedsForMovedGames;
    if (typeof downloadedFeedsInPrevCall === 'undefined')
    {
        downloadedFeedsInPrevCall = {};
    }
    updater.last_doc_update_category = 5;

    var utilPage = cjs.dic.get("util_page");
    var myGamesCount = cjs.mygames.getCount();
    var myTeamsCount = 0;
    if (cjs.myTeams)
    {
        myTeamsCount = cjs.myTeams.getCount();
    }

    if (myGamesCount || myTeamsCount)
    {
        if (sudate != 0)
        {
            sudate = 0;

            if (myGamesCount)
            {
                loadTodayFeed = true;
            }

            push_refresh();
        }
    }
    cjs.Api.loader.get('reactCalls').call(function(reactCalls) {
        reactCalls.loadingState('mygames', false);
        reactCalls.loadingState('fullFeed', false);
    });
    if (myGamesCount)
    {
        cjs.Api.loader.get('reactCalls').call(function(reactCalls) {
            reactCalls.loadingStateReset();
        });
        cjs.feedLoader.reset();
        cjs.feedLoader.setBeforeCallback(function(){
            updater.parse_only = true;
        });

        cjs.feedLoader.executeFilterCallback(function(context){
            return /^full|^odds/.test(context);
        });

        var eventHolderProxy = cjs.dic.get('dataEventHolderProxy');
        var leagueHolderProxy = cjs.dic.get('dataLeagueHolderProxy');
        eventHolderProxy.getHolder().addItemsFromRawObject(cjs.mygames.getData());
        leagueHolderProxy.getHolder().addItemsFromRawObject(cjs.mygames.getLabels());
        eventHolderProxy.getHandler().resetIds();
        leagueHolderProxy.getHandler().resetIds();

        var frepair = prevNeedRepair;
        var neededFeeds = []; //today feeds
        neededFeeds = neededFeeds.concat(cjs.mygames.getNeededFeeds(1));

        var tmpSudate = sudate;

        for (var i in neededFeeds)
        {
            if (neededFeeds[i].sport_id == sport_id && !utilPage.isMixed() && !utilPage.isParent() && !loadTodayFeed)
            {
                continue;
            }
            feedRequest = cjs.feedRequest.getFeedData('full', neededFeeds[i].sport_id);
            if (downloadedFeedsInPrevCall[feedRequest.context] === true)
            {
                continue;
            }
            downloadedFeedsInPrevCall[feedRequest.context] = true;
            cjs.feedLoader.addIntoQueue(feedRequest);

            
            frepair = true;
        }

        var neededFeeds = []; //other feeds
        neededFeeds = neededFeeds.concat(cjs.mygames.getNeededFeeds());

        for (var i in neededFeeds)
        {
            feedRequest = cjs.feedRequest.getFeedData('full', neededFeeds[i].sport_id, neededFeeds[i].day);
            if (downloadedFeedsInPrevCall[feedRequest.context] === true)
            {
                continue;
            }
            downloadedFeedsInPrevCall[feedRequest.context] = true;
            cjs.feedLoader.addIntoQueue(feedRequest);
            frepair = true;
        }

        cjs.feedLoader.setAfterCallback(function(){
            cjs.Api.loader.get('reactCalls').call(function(reactCalls) {
                reactCalls.loadingState('mygames', false);
            });
            if (downloadFeedsForMovedGames != true)
            {
                loadAndShowMygamesContent(true, downloadedFeedsInPrevCall, frepair);
                return;
            }
            var feedData = cjs.feedRequest.getFeedData('frepair', 0);
            cjs.feedLoader.executeCompleteCallback(feedData.context);
            updater.parse_only = false;
            expand_collapse_league_load();
            if (!frepair)
            {
                sort_fs_data();
            }
            if (cjs.mygames.getCount())
            {
                cjs.mygames.load(true);
            }

            if (cjs.dic.get('Helper_MyGamesChecker').isMyGames())
            {
                generateMygames();
            }
        });

        sudate = tmpSudate;
        if(frepair && downloadFeedsForMovedGames === true)
        {
            cjs.feedLoader.addIntoQueue(cjs.feedRequest.getFeedData('frepair', 0));
        }
        cjs.Api.loader.get('reactCalls').call(function(reactCalls) {
            reactCalls.loadingState('mygames', true);
        });
        cjs.feedLoader.downloadAndExecuteFeeds();
    }
    else
    {
        generateMygames();
    }
};

function generateMygames()
{
    cjs.Api.loader.get('reactCalls').call(function(reactCalls) {
        reactCalls.reloadMyGamesTabCounter();
        reactCalls.reloadTabContent(5);
        reactCalls.loadingState('mygames', false);
    });
};

function show_more_templates()
{
    const node = document.getElementById("mt");
    node.querySelectorAll(".leftMenu__item--hidden").forEach((elem) => elem.classList.remove("leftMenu__item--hidden"))
    const showMore = node.querySelector(".show-more");
    if (showMore) {
        showMore.classList.add("leftMenu__item--hidden");
    }
};

function hasRepairFeed(sd)
{
    return sd == 0 || sd == -1;
};

/**
 * NEMAZAT!!! VOLA SE V ADMINU GTM
 */
function runAfterGtmLoaded()
{
    if (typeof ga !== 'undefined')
    {
        var tracker = ga.getAll()[0];
        var linkerParamValue = tracker.get('linkerParam').replace('_ga=', '');
        var twoYears = 3600 * 24 * 365 * 2;
        cjs.Api.clientStorage.storeCookie('_lsga', linkerParamValue, twoYears);
    }
};

function setupInitialLoading(action)
{
    cjs.Api.loader.get('reactCalls').call(function(reactCalls) {
        reactCalls.loadingStateReset();
        if (action == 'country')
        {
            reactCalls.loadingState("country", true);
        }
        else
        {
            reactCalls.loadingState("fullFeed", true);
        }
    });
}

function resetAndExecuteFeedRequests(sportId, feedName, afterCallback)
{
    cjs.feedLoader.reset();
    setupInitialLoading(feedName);
    if (feedName !== 'full' || hasRepairFeed(sudate))
    {
        cjs.feedLoader.addIntoQueue(cjs.feedRequest.getFeedData('frepair', sportId));
    }

    cjs.feedLoader.addIntoQueue(cjs.feedRequest.getFeedData(feedName, sportId));
    cjs.feedLoader.executeFilterCallback(function(contextName){
        var pattern = "^" + feedName;
        var re = new RegExp(pattern);
        return re.test(contextName);
    });
    cjs.feedLoader.setAfterCallback(afterCallback);
    cjs.feedLoader.downloadAndExecuteFeeds();
};

function clog() {
    try
    {
        if (window.console)
        {
            for (var i in arguments)
            {
                // @debug
                console.log(arguments[i]);
            }
        }
    }
    catch (err) {}
};

function cerr() {
    try
    {
        for (var i in arguments)
        {
            // @debug
            console.error(arguments[i]);
        }
    }
    catch (err) {

    }
};

function cdir() {
    try
    {
        for (var i in arguments)
        {
            // @debug
            console.dir(arguments[i]);
        }
    } catch (err) {}
};

cjs.ready.then(function () {
    cjs.Api.loader.get('localizationRedirector').call(function(localizationRedirector) {
        localizationRedirector.redirect();
    });

    cjs.Api.loader.get('tv/channelsStorage').call();

    cjs.Api.loader.get('modules/eventTracking/search').call();

    cjs.Api.loader.get('cjs').fulfill(function (cjsCallback) {
        cjsCallback(cjs);
    });
});

