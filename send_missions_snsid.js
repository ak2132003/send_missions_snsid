// ==UserScript==
// @name         Token Panel (By Dr. Ahmed Khaled)
// @namespace    https://ahmed-khaled.com/
// @version      1.3
// @description  مشاركة العملات في المهمات - يسمح فقط لـ snsid الموجود في قاعدة البيانات
// @match        *.centurygames.com/*
// @grant        unsafeWindow
// ==/UserScript==

(function () {
    'use strict';

    // الدالة المساعدة لضمان وجود document.body قبل الإضافة
    function safeAppend(element) {
        if (!document.body) {
            setTimeout(() => safeAppend(element), 100);
        } else {
            document.body.appendChild(element);
        }
    }

    const SUPABASE_URL = 'https://wuauxagghhzqrxgotcqo.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1YXV4YWdnaGh6cXJ4Z290Y3FvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0NjU3NzYsImV4cCI6MjA2ODA0MTc3Nn0.W7Ayyfdh3qmrfzw_F5t35umQZRIdmqKENNdk3HYcNVE';

    // 1. إنشاء عنصر الأيقونة
    const iconButton = document.createElement('div');
    iconButton.innerHTML = '🪙';
    iconButton.title = "فتح سكربت العملات";
    iconButton.style = `
        position: fixed;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%);
        background: #222;
        color: white;
        font-size: 24px;
        padding: 10px 15px;
        border-radius: 50%;
        cursor: pointer;
        z-index: 9999;
        box-shadow: 0 0 10px #000;
    `;

    // 2. إنشاء لوحة التحكم
    const panelDiv = document.createElement('div');
    panelDiv.className = 'dr-panel';
    panelDiv.style = `
        display: none;
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #222;
        padding: 15px;
        border-radius: 10px;
        z-index: 9999;
        color: white;
        width: 300px;
        box-shadow: 0 0 10px #000;
    `;

    panelDiv.innerHTML = `
        <h3>🎯 مشاركة الروابط (المهمات)</h3>
        <select id="missionSelect" style="margin-bottom:10px;">
            <option value="ALL">📌 كل المهمات</option>
            <option value="MysticTreasureHunt">MysticTreasureHunt</option>
            <option value="MysteryShopKeeper">MysteryShopKeeper</option>
            <option value="HalloweenEvent">HalloweenEvent</option>
            <option value="TheCandyDreamHouse">TheCandyDreamHouse</option>
            <option value="ComeinIfYouDare">ComeinIfYouDare</option>
            <option value="VikingVoyage_revival">VikingVoyage_revival</option>
            <option value="WishesDoComeTrue_revival">WishesDoComeTrue_revival</option>
            <option value="BecomingaChampioninWinter">BecomingaChampioninWinter</option>
            <option value="PerfectSelfieofMoms_revival">PerfectSelfieofMoms_revival</option>
            <option value="LuckyandtheLepreca_revival">LuckyandtheLepreca_revival</option>
            <option value="FunTimeatTheAmusementPark">FunTimeatTheAmusementPark</option>
            <option value="OutdoorFilmFestival">OutdoorFilmFestival</option>
            <option value="MidsummerEnchantedForest_revival">MidsummerEnchantedForest_revival</option>
            <option value="FathersDayGift">FathersDayGift</option>
            <option value="CruiseVacationFilm">CruiseVacationFilm</option>
            <option value="TheLoveStory_revival">TheLoveStory_revival</option>
            <option value="FoundtheRealGold_revival">FoundtheRealGold_revival</option>
            <option value="PinballGame">PinballGame</option>
            <option value="NewBattlePass">NewBattlePass</option>
            <option value="HappyElimination">HappyElimination</option>
        </select>
        <textarea id="ssidInput" placeholder="ssid1\nssid2\nssid3"
            style="width: 100%; height: 100px; margin-top: 8px; resize: vertical;"></textarea>
        <div style="display: flex; gap: 8px; margin-top: 10px;">
            <button id="sendBtn">📤 إرسال</button>
            <button id="receiveBtn">📥 استقبال</button>
        </div>
        <div id="loadingSpinner" style="display:none;margin-top:10px;color:white;">🔄 جاري المعالجة...</div>
        <div id="resultMessage" style="margin-top:12px;color:white;font-weight:bold;white-space:pre-wrap;"></div>
        <div style="text-align:center;color:white;font-size:14px;margin-top:10px;">👑 سكريبت ميجا</div>
        <div style="text-align:center;color:white;font-size:14px;margin-top:10px;">👑 بواسطة د.أحمد خالد</div>
        <div class="close-btn" style="position:absolute;top:5px;right:10px;cursor:pointer;" title="إغلاق">✖️</div>
    `;

    // 3. إضافة العناصر إلى الصفحة
    safeAppend(iconButton);
    safeAppend(panelDiv);

    // 4. إعداد الأحداث
    iconButton.onclick = () => {
        panelDiv.style.display = 'block';
        iconButton.style.display = 'none';
    };

    panelDiv.querySelector('.close-btn').onclick = () => {
        panelDiv.style.display = 'none';
        iconButton.style.display = 'block';
    };

    // 5. وظائف السكربت
    const allActivities = Array.from(panelDiv.querySelector('#missionSelect').options)
        .filter(opt => opt.value !== 'ALL')
        .map(opt => opt.value);
    
    const sleep = ms => new Promise(r => setTimeout(r, ms));

    async function handleAction(actionType) {
        const input = panelDiv.querySelector('#ssidInput').value.trim();
        const selectedActivity = panelDiv.querySelector('#missionSelect').value;
        const spinner = panelDiv.querySelector('#loadingSpinner');
        const resultMsg = panelDiv.querySelector('#resultMessage');
        resultMsg.textContent = '';
        resultMsg.style.color = 'white';

        const snsid = document.querySelector('#user-snsid')?.textContent?.match(/\d+/)?.[0]
            || document.querySelector('.footer-snsid')?.textContent?.match(/\d+/)?.[0]
            || 'unknown';

        if (snsid === 'unknown') {
            resultMsg.style.color = 'red';
            resultMsg.textContent = "⚠️ لم يتم التعرف على رقم SNSID";
            return;
        }

        const checkRes = await fetch(`${SUPABASE_URL}/rest/v1/allow_snsid_for_missions?snsid=eq.${snsid}`, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        const checkData = await checkRes.json();
        if (!checkData || checkData.length === 0) {
            resultMsg.style.color = 'red';
            resultMsg.textContent = "❌ هذه المزرعة غير مسموح لها باستخدام هذا السكربت";
            return;
        }

        if (!input || !selectedActivity) {
            resultMsg.style.color = 'red';
            resultMsg.textContent = "⚠️ من فضلك أدخل SSID واختر المهمة";
            return;
        }

        const ssids = input.split('\n')
            .map(line => line.trim().match(/\d+/))
            .filter(Boolean)
            .map(match => match[0]);

        if (ssids.length === 0) {
            resultMsg.style.color = 'red';
            resultMsg.textContent = "⚠️ من فضلك أدخل SSID صحيح في كل سطر";
            return;
        }

        spinner.style.display = 'block';
        const targetActivities = selectedActivity === 'ALL' ? allActivities : [selectedActivity];
        let total = 0;

        try {
            for (const activity of targetActivities) {
                for (const ssid of ssids) {
                    await unsafeWindow.NetUtils.request('Activity/SharingToken', {
                        action: actionType,
                        activity,
                        [`${actionType === 'send' ? 'to' : 'from'}Snsids`]: [ssid],
                        needResponse: actionType === 'send' ? 'Activity/SharingToken' : 'Activity/SharingToken3',
                        ...(actionType === 'accept' ? { opTime: 1011.327 } : { cur_sceneid: 2 })
                    });
                    await sleep(0);
                    total++;
                }
            }

            resultMsg.style.color = '#0f0';
            resultMsg.textContent = `✅ تم ${actionType === 'send' ? 'إرسال' : 'استقبال'} العملات بنجاح!\nعدد العمليات: ${total}`;
        } catch (e) {
            resultMsg.style.color = 'red';
            resultMsg.textContent = `❌ فشل تنفيذ العملية: ${e.message || e}`;
            console.error(e);
        } finally {
            spinner.style.display = 'none';
        }
    }

    panelDiv.querySelector('#sendBtn').onclick = () => handleAction('send');
    panelDiv.querySelector('#receiveBtn').onclick = () => handleAction('accept');
})();
