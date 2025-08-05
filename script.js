// 全局变量
let map;
let places = [];

// 初始化地图
function initMap() {
    try {
        console.log('开始初始化地图...');
        
        // 检查Leaflet是否加载
        if (typeof L === 'undefined') {
            throw new Error('Leaflet库未加载');
        }
        
        // 检查地图容器是否存在
        const mapContainer = document.getElementById('map');
        if (!mapContainer) {
            throw new Error('地图容器未找到');
        }
        
        // 创建地图实例
        map = L.map('map', {
            center: [30, 120], // 以中国为中心
            zoom: 4,
            zoomControl: true,
            scrollWheelZoom: true,
            doubleClickZoom: true,
            boxZoom: true,
            keyboard: true,
            dragging: true,
            touchZoom: true
        });

        // 添加地图图层 - 使用温馨的地图样式
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18
        }).addTo(map);

        console.log('地图初始化成功');
        
    } catch (error) {
        console.error('地图初始化失败:', error);
        showMapError(error.message);
    }
}

// 显示地图错误信息
function showMapError(errorMessage) {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.innerHTML = `
            <div class="text-center">
                <div class="text-6xl mb-4">😵</div>
                <p class="text-lg text-red-600 font-medium">地图加载失败</p>
                <p class="text-sm text-gray-500 mt-2">${errorMessage}</p>
                <button onclick="location.reload()" class="mt-4 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600">
                    重新加载
                </button>
            </div>
        `;
    }
}

// 在地图上添加标记
function addMarkersToMap(places) {
    if (!map || !places || places.length === 0) {
        console.log('地图或数据未准备好');
        return;
    }

    console.log('开始在地图上添加标记...');
    
    // 创建标记组
    const markersGroup = L.layerGroup().addTo(map);
    
    // 存储所有标记的坐标，用于调整地图视图
    const bounds = [];
    
    places.forEach((place, index) => {
        // 验证坐标数据
        if (!place.lat || !place.lng) {
            console.warn('地点缺少坐标信息:', place.city);
            return;
        }
        
        const lat = parseFloat(place.lat);
        const lng = parseFloat(place.lng);
        
        if (isNaN(lat) || isNaN(lng)) {
            console.warn('地点坐标格式错误:', place.city, place.lat, place.lng);
            return;
        }
        
        // 添加到边界数组
        bounds.push([lat, lng]);
        
        // 创建自定义标记图标
        const customIcon = createCustomMarkerIcon(place.type, index, place.city);
        
        // 创建标记
        const marker = L.marker([lat, lng], { icon: customIcon })
            .addTo(markersGroup);
        
        // 创建弹出窗口内容
        const popupContent = createMarkerPopup(place, index);
        
        // 绑定弹出窗口
        marker.bindPopup(popupContent, {
            maxWidth: 300,
            className: 'custom-popup'
        });
        
        // 添加点击事件
        marker.on('click', function() {
            // 可以在这里添加额外的点击处理逻辑
            console.log('点击了标记:', place.city);
        });
        
        console.log(`添加标记: ${place.city} (${lat}, ${lng})`);
    });
    
    // 如果有标记，调整地图视图以显示所有标记
    if (bounds.length > 0) {
        try {
            if (bounds.length === 1) {
                // 只有一个标记时，设置中心点和缩放级别
                map.setView(bounds[0], 10);
            } else {
                // 多个标记时，调整视图以包含所有标记
                const group = new L.featureGroup(markersGroup.getLayers());
                map.fitBounds(group.getBounds().pad(0.1));
            }
        } catch (error) {
            console.error('调整地图视图失败:', error);
        }
    }
    
    console.log(`成功添加 ${bounds.length} 个地图标记`);
}

// 创建自定义标记图标
function createCustomMarkerIcon(type, index, cityName) {
    // 根据地点类型选择颜色和图标
    const typeConfig = {
        'city': { color: '#ff6b9d', emoji: '🏙️' },
        'nature': { color: '#4ecdc4', emoji: '🌿' },
        'beach': { color: '#45b7d1', emoji: '🏖️' },
        'mountain': { color: '#96ceb4', emoji: '⛰️' },
        'historical': { color: '#feca57', emoji: '🏛️' },
        'cultural': { color: '#ff9ff3', emoji: '🎭' },
        'culture': { color: '#ff9ff3', emoji: '🎭' },
        'food': { color: '#ff6348', emoji: '🍜' },
        'shopping': { color: '#dda0dd', emoji: '🛍️' },
        'romantic': { color: '#ff69b4', emoji: '💕' },
        'adventure': { color: '#54a0ff', emoji: '🎒' }
    };
    
    const config = typeConfig[type] || { color: '#ff6b9d', emoji: '📍' };
    
    // 处理城市名称长度，如果太长则截取
    const displayName = cityName.length > 4 ? cityName.substring(0, 3) + '…' : cityName;
    
    // 创建HTML标记
    const markerHtml = `
        <div class="custom-marker" style="
            background: ${config.color};
            width: 40px;
            height: 40px;
            border-radius: 50% 50% 50% 0;
            border: 3px solid white;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            transform: rotate(-45deg);
            position: relative;
        ">
            <span style="transform: rotate(45deg);">${config.emoji}</span>
            <div style="
                position: absolute;
                top: -12px;
                right: -15px;
                background: white;
                color: ${config.color};
                border-radius: 8px;
                min-width: 24px;
                height: 18px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 8px;
                font-weight: bold;
                border: 2px solid ${config.color};
                transform: rotate(45deg);
                padding: 2px 4px;
                white-space: nowrap;
                box-shadow: 0 1px 4px rgba(0,0,0,0.2);
            ">${displayName}</div>
        </div>
    `;
    
    return L.divIcon({
        html: markerHtml,
        className: 'custom-div-icon',
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40]
    });
}

// 创建标记弹出窗口内容
function createMarkerPopup(place, index) {
    const date = new Date(place.dateTime || place.date);
    const formattedDate = date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    // 获取第一张照片作为预览
    const previewPhoto = place.photos && place.photos.length > 0 ? place.photos[0] : null;
    
    const photoHtml = previewPhoto ? `
        <div class="popup-photo" style="margin-bottom: 10px;">
            <img src="${previewPhoto}" alt="${place.city}" style="
                width: 100%;
                height: 120px;
                object-fit: cover;
                border-radius: 8px;
                cursor: pointer;
            " onclick="openPhotoModal('${previewPhoto}', '${place.photos.join(',')}', 0)">
        </div>
    ` : '';
    
    const tagsHtml = place.tags && place.tags.length > 0 ? `
        <div class="popup-tags" style="margin-top: 8px;">
            ${place.tags.map(tag => `
                <span style="
                    background: #f0f0f0;
                    color: #666;
                    padding: 2px 6px;
                    border-radius: 12px;
                    font-size: 11px;
                    margin-right: 4px;
                    display: inline-block;
                ">${tag}</span>
            `).join('')}
        </div>
    ` : '';
    
    return `
        <div class="marker-popup" style="font-family: 'Noto Sans SC', sans-serif;">
            <div style="
                background: linear-gradient(135deg, #ff6b9d, #c44569);
                color: white;
                padding: 8px 12px;
                margin: -10px -15px 10px -15px;
                border-radius: 8px 8px 0 0;
                text-align: center;
            ">
                <h3 style="margin: 0; font-size: 16px; font-weight: 600;">
                    ${getCityEmoji(place.type)} ${place.city}
                </h3>
                <p style="margin: 2px 0 0 0; font-size: 12px; opacity: 0.9;">
                    ${place.country} • ${formattedDate}
                </p>
            </div>
            
            ${photoHtml}
            
            <div style="
                font-size: 13px;
                line-height: 1.4;
                color: #333;
                max-height: 80px;
                overflow: hidden;
                text-overflow: ellipsis;
                margin-bottom: 8px;
            ">
                ${place.story.length > 100 ? place.story.substring(0, 100) + '...' : place.story}
            </div>
            
            ${tagsHtml}
            
            <div style="text-align: center; margin-top: 10px;">
                <button onclick="openCardModal(${index})" style="
                    background: linear-gradient(135deg, #ff6b9d, #c44569);
                    color: white;
                    border: none;
                    padding: 6px 12px;
                    border-radius: 15px;
                    font-size: 12px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                    查看详情 💕
                </button>
            </div>
        </div>
    `;
}





// 加载旅行地点数据
async function loadPlaces() {
    try {
        const response = await fetch('places.json');
        places = await response.json();
        
        // 初始化时间线状态
        timelineState.originalPlaces = places;
        timelineState.filteredPlaces = [...places];
        
        // 更新统计信息
        updateStats();
        
        // 在地图上添加标记
        addMarkersToMap(places);
        
        // 生成时间线卡片
        generateTimeline(places);
        
    } catch (error) {
        console.error('加载旅行数据失败:', error);
        showErrorMessage();
    }
}

// 显示错误信息
function showErrorMessage() {
    const loading = document.getElementById('loading');
    loading.innerHTML = `
        <div class="text-center">
            <div class="text-6xl mb-4">😅</div>
            <p class="text-lg text-gray-600 font-medium">还没有添加旅行数据哦</p>
            <p class="text-sm text-gray-500 mt-2">请创建 places.json 文件来记录你们的甜蜜回忆</p>
        </div>
    `;
}

// 更新统计信息
function updateStats() {
    const cityCount = places.length;
    const countries = [...new Set(places.map(place => place.country))];
    const countryCount = countries.length;
    
    // 动画更新数字
    animateNumber('cityCount', cityCount);
    animateNumber('countryCount', countryCount);
    animateNumber('memoryCount', cityCount);
}

// 数字动画
function animateNumber(elementId, targetNumber) {
    const element = document.getElementById(elementId);
    const duration = 1000;
    const steps = 30;
    const increment = targetNumber / steps;
    let current = 0;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= targetNumber) {
            current = targetNumber;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current);
    }, duration / steps);
}

// 事件监听器
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM加载完成，开始初始化...');
    
    // 等待一小段时间确保所有资源加载完成
    setTimeout(() => {
        // 初始化地图
        initMap();
        
        // 加载旅行数据
        loadPlaces();
        
        // 初始化统计卡片点击事件
        initStatsCardEvents();
        
        // 初始化城市列表弹框
        initCityListModal();
        
        // 初始化国家列表弹框
        initCountryListModal();
        
        // 初始化回忆列表弹框
        initMemoryListModal();
        
        // 卡片模态框事件
        const cardModal = document.getElementById('cardModal');
        const cardModalClose = document.querySelector('.card-modal-close');
        
        if (cardModalClose) {
            cardModalClose.addEventListener('click', closeCardModal);
        }
        
        // 点击模态框背景关闭
        if (cardModal) {
            cardModal.addEventListener('click', (e) => {
                if (e.target === cardModal) {
                    closeCardModal();
                }
            });
        }
        

        
        // 添加随机飘浮的装饰元素
        setInterval(createRandomFloatingElement, 5000);
    }, 100);
});

// 创建随机飘浮装饰元素
function createRandomFloatingElement() {
    const elements = ['🌸', '💕', '⭐', '🌙', '☁️', '🦋'];
    const element = document.createElement('div');
    element.innerHTML = elements[Math.floor(Math.random() * elements.length)];
    element.style.position = 'fixed';
    element.style.fontSize = '20px';
    element.style.pointerEvents = 'none';
    element.style.zIndex = '1';
    element.style.opacity = '0.6';
    element.style.left = Math.random() * window.innerWidth + 'px';
    element.style.top = window.innerHeight + 'px';
    element.style.animation = 'heartFloat 8s ease-out forwards';
    
    document.body.appendChild(element);
    
    setTimeout(() => {
        if (document.body.contains(element)) {
            document.body.removeChild(element);
        }
    }, 8000);
}

// 响应式处理
window.addEventListener('resize', function() {
    if (map) {
        setTimeout(() => {
            map.invalidateSize();
        }, 100);
    }
    
    // 响应式视图调整 - 仅在用户没有手动选择过视图时自动调整
    handleResponsiveViewChange();
});

// 处理响应式视图变化
function handleResponsiveViewChange() {
    // 检查是否需要根据屏幕大小调整视图
    const isMobile = isMobileDevice();
    const currentView = timelineState.currentView;
    
    // 如果当前是桌面端但使用移动端视图，或者是移动端但使用桌面端视图，则自动调整
    // 但保留用户的手动选择权
    if (isMobile && currentView === 'timeline') {
        // 移动端建议使用grid视图，但不强制切换，让用户保持选择
        console.log('检测到移动端设备，建议使用九宫格视图以获得更好的体验');
    } else if (!isMobile && currentView === 'grid') {
        // 桌面端建议使用timeline视图，但不强制切换
        console.log('检测到桌面端设备，建议使用时间线视图以获得更好的体验');
    }
}

// 移动端检测函数
function isMobileDevice() {
    return window.innerWidth <= 768 || 
           'ontouchstart' in window || 
           navigator.maxTouchPoints > 0 ||
           /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// 触摸设备优化
if ('ontouchstart' in window) {
    document.body.classList.add('touch-device');
}

// 时间线状态管理
const timelineState = {
    originalPlaces: [],
    filteredPlaces: [],
    currentView: isMobileDevice() ? 'grid' : 'timeline', // 移动端默认使用九宫格模式
    currentSort: 'newest',
    currentFilter: 'all',
    searchQuery: ''
};

// 生成时间线卡片
function generateTimeline(places) {
    const timeline = document.getElementById('timeline');
    if (!timeline) {
        console.error('时间线容器未找到');
        return;
    }

    // 初始化时间线控制功能
    initTimelineControls();

    // 渲染时间线
    renderTimeline();

    console.log('时间线卡片生成完成');
}

// 初始化时间线控制功能
function initTimelineControls() {
    // 初始化视图状态
    initializeViewState();
    
    // 移动端搜索功能
    const mobileSearchInput = document.getElementById('timelineSearch');
    const mobileClearSearchBtn = document.getElementById('clearSearch');
    
    // 桌面端搜索功能
    const desktopSearchInput = document.getElementById('timelineSearchDesktop');
    const desktopClearSearchBtn = document.getElementById('clearSearchDesktop');
    
    // 搜索输入同步
    function syncSearchInputs(sourceInput, targetInput) {
        if (sourceInput && targetInput) {
            sourceInput.addEventListener('input', (e) => {
                targetInput.value = e.target.value;
                handleSearch(e);
            });
        }
    }
    
    // 同步移动端和桌面端搜索框
    syncSearchInputs(mobileSearchInput, desktopSearchInput);
    syncSearchInputs(desktopSearchInput, mobileSearchInput);
    
    // 移动端搜索事件
    if (mobileSearchInput) {
        mobileSearchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
            }
        });
    }
    
    // 桌面端搜索事件
    if (desktopSearchInput) {
        desktopSearchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
            }
        });
    }

    // 清除搜索按钮
    if (mobileClearSearchBtn) {
        mobileClearSearchBtn.addEventListener('click', () => clearSearch('mobile'));
    }
    
    if (desktopClearSearchBtn) {
        desktopClearSearchBtn.addEventListener('click', () => clearSearch('desktop'));
    }

    // 移动端下拉菜单控制
    initMobileDropdowns();

    // 筛选按钮
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => handleFilter(btn.dataset.filter));
    });

    // 桌面端排序选择
    const sortSelect = document.getElementById('timelineSort');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => handleSort(e.target.value));
    }

    // 桌面端视图切换
    const viewButtons = document.querySelectorAll('.view-btn');
    viewButtons.forEach(btn => {
        btn.addEventListener('click', () => handleViewChange(btn.dataset.view));
    });

    // 清除筛选按钮
    const clearFiltersBtn = document.getElementById('clearFilters');
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', clearAllFilters);
    }

    // 重置按钮
    const resetFiltersBtn = document.getElementById('resetFilters');
    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', clearAllFilters);
    }

    // 点击外部关闭下拉菜单
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.sort-control-mobile') && !e.target.closest('.view-control-mobile')) {
            closeAllDropdowns();
        }
    });
}

// 初始化移动端下拉菜单
function initMobileDropdowns() {
    // 排序下拉菜单
    const sortToggle = document.getElementById('sortToggle');
    const sortDropdown = document.getElementById('sortDropdown');
    const sortItems = document.querySelectorAll('#sortDropdown .dropdown-item');
    
    if (sortToggle && sortDropdown) {
        sortToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleDropdown(sortDropdown);
            closeDropdown(document.getElementById('viewDropdown'));
        });
        
        sortItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                const sortValue = item.dataset.sort;
                handleSort(sortValue);
                updateDropdownSelection(sortItems, item);
                closeDropdown(sortDropdown);
            });
        });
    }
    
    // 视图下拉菜单
    const viewToggle = document.getElementById('viewToggle');
    const viewDropdown = document.getElementById('viewDropdown');
    const viewItems = document.querySelectorAll('#viewDropdown .dropdown-item');
    
    if (viewToggle && viewDropdown) {
        viewToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleDropdown(viewDropdown);
            closeDropdown(document.getElementById('sortDropdown'));
        });
        
        viewItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                const viewValue = item.dataset.view;
                handleViewChange(viewValue);
                updateDropdownSelection(viewItems, item);
                closeDropdown(viewDropdown);
            });
        });
    }
}

// 切换下拉菜单显示状态
function toggleDropdown(dropdown) {
    if (dropdown) {
        dropdown.classList.toggle('show');
    }
}

// 关闭下拉菜单
function closeDropdown(dropdown) {
    if (dropdown) {
        dropdown.classList.remove('show');
    }
}

// 关闭所有下拉菜单
function closeAllDropdowns() {
    const dropdowns = document.querySelectorAll('.dropdown-menu');
    dropdowns.forEach(dropdown => {
        dropdown.classList.remove('show');
    });
}

// 更新下拉菜单选中状态
function updateDropdownSelection(items, selectedItem) {
    items.forEach(item => {
        item.classList.remove('active');
    });
    selectedItem.classList.add('active');
}

// 初始化视图状态
function initializeViewState() {
    // 更新视图按钮状态
    const viewButtons = document.querySelectorAll('.view-btn');
    viewButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === timelineState.currentView);
    });

    // 更新容器视图
    const timeline = document.getElementById('timeline');
    if (timeline) {
        timeline.setAttribute('data-view', timelineState.currentView);
    }
}

// 处理搜索
function handleSearch(e) {
    const query = e.target.value.toLowerCase().trim();
    timelineState.searchQuery = query;
    
    // 更新移动端清除按钮
    const mobileClearBtn = document.getElementById('clearSearch');
    if (mobileClearBtn) {
        if (query) {
            mobileClearBtn.classList.add('visible');
        } else {
            mobileClearBtn.classList.remove('visible');
        }
    }
    
    // 更新桌面端清除按钮
    const desktopClearBtn = document.getElementById('clearSearchDesktop');
    if (desktopClearBtn) {
        if (query) {
            desktopClearBtn.classList.add('visible');
        } else {
            desktopClearBtn.classList.remove('visible');
        }
    }
    
    applyFiltersAndRender();
}

// 清除搜索
function clearSearch(source = 'mobile') {
    const mobileSearchInput = document.getElementById('timelineSearch');
    const desktopSearchInput = document.getElementById('timelineSearchDesktop');
    const mobileClearBtn = document.getElementById('clearSearch');
    const desktopClearBtn = document.getElementById('clearSearchDesktop');
    
    // 清空两个搜索框
    if (mobileSearchInput) {
        mobileSearchInput.value = '';
    }
    if (desktopSearchInput) {
        desktopSearchInput.value = '';
    }
    
    timelineState.searchQuery = '';
    
    // 隐藏清除按钮
    if (mobileClearBtn) {
        mobileClearBtn.classList.remove('visible');
    }
    if (desktopClearBtn) {
        desktopClearBtn.classList.remove('visible');
    }
    
    // 重新聚焦到对应的搜索框
    if (source === 'mobile' && mobileSearchInput) {
        mobileSearchInput.focus();
    } else if (source === 'desktop' && desktopSearchInput) {
        desktopSearchInput.focus();
    }
    
    applyFiltersAndRender();
}

// 处理筛选
function handleFilter(filter) {
    timelineState.currentFilter = filter;
    
    // 更新按钮状态
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === filter);
    });

    applyFiltersAndRender();
}

// 处理排序
function handleSort(sortType) {
    timelineState.currentSort = sortType;
    applyFiltersAndRender();
}

// 处理视图切换
function handleViewChange(view) {
    timelineState.currentView = view;
    
    // 更新按钮状态
    const viewButtons = document.querySelectorAll('.view-btn');
    viewButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === view);
    });

    // 更新容器视图
    const timeline = document.getElementById('timeline');
    if (timeline) {
        timeline.setAttribute('data-view', view);
    }

    // 重新渲染以适应新视图
    renderTimeline();
}

// 应用筛选和渲染
function applyFiltersAndRender() {
    let filtered = [...timelineState.originalPlaces];

    // 应用搜索
    if (timelineState.searchQuery) {
        filtered = filtered.filter(place => {
            const searchText = `${place.city} ${place.country} ${place.story} ${(place.tags || []).join(' ')}`.toLowerCase();
            return searchText.includes(timelineState.searchQuery);
        });
    }

    // 应用筛选
    if (timelineState.currentFilter !== 'all') {
        filtered = filtered.filter(place => {
            if (timelineState.currentFilter === '2024' || timelineState.currentFilter === '2023') {
                const year = new Date(place.dateTime || place.date).getFullYear().toString();
                return year === timelineState.currentFilter;
            }
            return place.type === timelineState.currentFilter || 
                   (place.tags && place.tags.includes(timelineState.currentFilter));
        });
    }

    // 应用排序
    filtered.sort((a, b) => {
        const dateA = new Date(a.dateTime || a.date);
        const dateB = new Date(b.dateTime || b.date);
        
        switch (timelineState.currentSort) {
            case 'newest':
                return dateB - dateA;
            case 'oldest':
                return dateA - dateB;
            case 'alphabetical':
                return a.city.localeCompare(b.city);
            default:
                return dateB - dateA;
        }
    });

    timelineState.filteredPlaces = filtered;
    renderTimeline();
    updateFilterResults();
}

// 渲染时间线
function renderTimeline() {
    const timeline = document.getElementById('timeline');
    const emptyState = document.getElementById('emptyState');
    
    if (!timeline) return;

    // 清空现有内容
    timeline.innerHTML = '';

    if (timelineState.filteredPlaces.length === 0) {
        // 显示空状态
        if (emptyState) {
            emptyState.style.display = 'block';
        }
        return;
    }

    // 隐藏空状态
    if (emptyState) {
        emptyState.style.display = 'none';
    }

    // 生成卡片
    timelineState.filteredPlaces.forEach((place, index) => {
        const card = createTimelineCard(place, index);
        timeline.appendChild(card);
    });

    // 照片滑动器初始化已移除，现在使用静态网格布局
}

// 更新筛选结果提示
function updateFilterResults() {
    const filterResults = document.getElementById('filterResults');
    const resultsText = filterResults?.querySelector('.results-text');
    
    if (!filterResults || !resultsText) return;

    const hasActiveFilters = timelineState.currentFilter !== 'all' || 
                           timelineState.searchQuery || 
                           timelineState.currentSort !== 'newest';

    if (hasActiveFilters && timelineState.filteredPlaces.length > 0) {
        const total = timelineState.originalPlaces.length;
        const filtered = timelineState.filteredPlaces.length;
        resultsText.textContent = `显示 ${filtered} 个结果，共 ${total} 个回忆`;
        filterResults.style.display = 'flex';
    } else {
        filterResults.style.display = 'none';
    }
}

// 清除所有筛选
function clearAllFilters() {
    // 重置状态
    timelineState.currentFilter = 'all';
    timelineState.searchQuery = '';
    timelineState.currentSort = 'newest';

    // 重置搜索框
    const mobileSearchInput = document.getElementById('timelineSearch');
    const desktopSearchInput = document.getElementById('timelineSearchDesktop');
    const mobileClearBtn = document.getElementById('clearSearch');
    const desktopClearBtn = document.getElementById('clearSearchDesktop');
    
    if (mobileSearchInput) mobileSearchInput.value = '';
    if (desktopSearchInput) desktopSearchInput.value = '';
    if (mobileClearBtn) mobileClearBtn.classList.remove('visible');
    if (desktopClearBtn) desktopClearBtn.classList.remove('visible');

    // 重置桌面端排序选择
    const sortSelect = document.getElementById('timelineSort');
    if (sortSelect) sortSelect.value = 'newest';

    // 重置移动端下拉菜单选中状态
    const sortItems = document.querySelectorAll('#sortDropdown .dropdown-item');
    const viewItems = document.querySelectorAll('#viewDropdown .dropdown-item');
    
    sortItems.forEach(item => {
        item.classList.toggle('active', item.dataset.sort === 'newest');
    });
    
    viewItems.forEach(item => {
        item.classList.toggle('active', item.dataset.view === 'cards');
    });

    // 重置筛选按钮
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === 'all');
    });

    // 重置桌面端视图按钮
    const viewButtons = document.querySelectorAll('.view-btn');
    viewButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === 'cards');
    });

    // 重新渲染
    applyFiltersAndRender();
}

// 创建时间线卡片
function createTimelineCard(place, index) {
    const card = document.createElement('div');
    card.className = `timeline-card ${index % 2 === 0 ? 'left' : 'right'}`;
    card.style.cursor = 'pointer';

    // 格式化日期
    const date = new Date(place.dateTime || place.date);
    const formattedDate = date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // 生成照片网格
    const photoGridHtml = generatePhotoGrid(place.photos || []);

    // 生成标签
    const tagsHtml = generateTags(place.tags || []);

    card.innerHTML = `
        <div class="timeline-node"></div>
        <div class="card-content">
            <div class="date-label">${formattedDate}</div>
            <div class="city-title">
                ${getCityEmoji(place.type)} ${place.city}, ${place.country}
            </div>
            ${photoGridHtml}
            <div class="story-text">${place.story}</div>
            ${tagsHtml}
        </div>
    `;

    // 添加点击事件
    card.addEventListener('click', () => {
        // 找到在原始数组中的索引
        const originalIndex = timelineState.originalPlaces.findIndex(p => 
            p.city === place.city && p.dateTime === place.dateTime
        );
        openCardModal(originalIndex >= 0 ? originalIndex : index);
    });

    return card;
}

// 生成照片网格
function generatePhotoGrid(photos) {
    if (!photos || photos.length === 0) {
        return '';
    }

    const photoCount = photos.length;
    
    // 根据照片数量选择不同的布局
    if (photoCount === 1) {
        return `
            <div class="relative rounded-xl overflow-hidden mb-4 group">
                <div class="aspect-[4/3] overflow-hidden">
                    <img src="${photos[0]}" alt="旅行照片" 
                         class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" 
                         loading="lazy" 
                         onerror="this.style.display='none'"
                         onclick="openPhotoModal('${photos[0]}', '${photos.join(',')}', 0)">
                </div>
            </div>
        `;
    } else if (photoCount === 2) {
        return `
            <div class="grid grid-cols-2 gap-2 rounded-xl overflow-hidden mb-4">
                ${photos.map((photo, index) => `
                    <div class="aspect-square overflow-hidden group cursor-pointer">
                        <img src="${photo}" alt="旅行照片" 
                             class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" 
                             loading="lazy" 
                             onerror="this.style.display='none'"
                             onclick="openPhotoModal('${photo}', '${photos.join(',')}', ${index})">
                    </div>
                `).join('')}
            </div>
        `;
    } else if (photoCount === 3) {
        return `
            <div class="grid grid-flow-col grid-rows-2 grid-cols-2 gap-2 rounded-xl overflow-hidden mb-4">
                <div class="row-span-2 aspect-[3/4] overflow-hidden group cursor-pointer">
                    <img src="${photos[0]}" alt="旅行照片" 
                         class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" 
                         loading="lazy" 
                         onerror="this.style.display='none'"
                         onclick="openPhotoModal('${photos[0]}', '${photos.join(',')}', 0)">
                </div>
                <div class="aspect-square overflow-hidden group cursor-pointer">
                    <img src="${photos[1]}" alt="旅行照片" 
                         class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" 
                         loading="lazy" 
                         onerror="this.style.display='none'"
                         onclick="openPhotoModal('${photos[1]}', '${photos.join(',')}', 1)">
                </div>
                <div class="aspect-square overflow-hidden group cursor-pointer">
                    <img src="${photos[2]}" alt="旅行照片" 
                         class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" 
                         loading="lazy" 
                         onerror="this.style.display='none'"
                         onclick="openPhotoModal('${photos[2]}', '${photos.join(',')}', 2)">
                </div>
            </div>
        `;
    } else if (photoCount === 4) {
        return `
            <div class="grid grid-cols-2 gap-2 rounded-xl overflow-hidden mb-4">
                ${photos.slice(0, 4).map((photo, index) => `
                    <div class="aspect-square overflow-hidden group cursor-pointer">
                        <img src="${photo}" alt="旅行照片" 
                             class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" 
                             loading="lazy" 
                             onerror="this.style.display='none'"
                             onclick="openPhotoModal('${photo}', '${photos.join(',')}', ${index})">
                    </div>
                `).join('')}
            </div>
        `;
    } else if (photoCount === 5) {
        return `
            <div class="grid grid-flow-col grid-rows-2 grid-cols-3 gap-2 rounded-xl overflow-hidden mb-4">
                <div class="aspect-square overflow-hidden group cursor-pointer">
                    <img src="${photos[0]}" alt="旅行照片" 
                         class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" 
                         loading="lazy" 
                         onerror="this.style.display='none'"
                         onclick="openPhotoModal('${photos[0]}', '${photos.join(',')}', 0)">
                </div>
                <div class="col-start-3 aspect-square overflow-hidden group cursor-pointer">
                    <img src="${photos[1]}" alt="旅行照片" 
                         class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" 
                         loading="lazy" 
                         onerror="this.style.display='none'"
                         onclick="openPhotoModal('${photos[1]}', '${photos.join(',')}', 1)">
                </div>
                <div class="aspect-square overflow-hidden group cursor-pointer">
                    <img src="${photos[2]}" alt="旅行照片" 
                         class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" 
                         loading="lazy" 
                         onerror="this.style.display='none'"
                         onclick="openPhotoModal('${photos[2]}', '${photos.join(',')}', 2)">
                </div>
                <div class="aspect-square overflow-hidden group cursor-pointer">
                    <img src="${photos[3]}" alt="旅行照片" 
                         class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" 
                         loading="lazy" 
                         onerror="this.style.display='none'"
                         onclick="openPhotoModal('${photos[3]}', '${photos.join(',')}', 3)">
                </div>
                <div class="row-start-1 col-start-2 col-span-2 aspect-[2/1] overflow-hidden group cursor-pointer">
                    <img src="${photos[4]}" alt="旅行照片" 
                         class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" 
                         loading="lazy" 
                         onerror="this.style.display='none'"
                         onclick="openPhotoModal('${photos[4]}', '${photos.join(',')}', 4)">
                </div>
            </div>
        `;
    } else {
        // 超过5张照片时，显示前4张，第4张显示剩余数量
        const remainingCount = photoCount - 3;
        return `
            <div class="grid grid-cols-2 gap-2 rounded-xl overflow-hidden mb-4">
                ${photos.slice(0, 3).map((photo, index) => `
                    <div class="aspect-square overflow-hidden group cursor-pointer">
                        <img src="${photo}" alt="旅行照片" 
                             class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" 
                             loading="lazy" 
                             onerror="this.style.display='none'"
                             onclick="openPhotoModal('${photo}', '${photos.join(',')}', ${index})">
                    </div>
                `).join('')}
                <div class="aspect-square overflow-hidden group cursor-pointer relative">
                    <img src="${photos[3]}" alt="旅行照片" 
                         class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" 
                         loading="lazy" 
                         onerror="this.style.display='none'"
                         onclick="openPhotoModal('${photos[3]}', '${photos.join(',')}', 3)">
                    <div class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white font-bold text-lg hover:bg-opacity-40 transition-all duration-300"
                         onclick="openPhotoModal('${photos[3]}', '${photos.join(',')}', 3)">
                        +${remainingCount}
                    </div>
                </div>
            </div>
        `;
    }
}

// 生成标签
function generateTags(tags) {
    if (!tags || tags.length === 0) {
        return '';
    }

    const tagsHtml = tags.map(tag => `<span class="tag">${tag}</span>`).join('');
    return `<div class="tags">${tagsHtml}</div>`;
}

// 获取城市类型对应的emoji
function getCityEmoji(type) {
    const emojiMap = {
        'city': '🏙️',
        'nature': '🌿',
        'beach': '🏖️',
        'mountain': '⛰️',
        'historical': '🏛️',
        'cultural': '🎭',
        'food': '🍜',
        'shopping': '🛍️',
        'romantic': '💕',
        'adventure': '🎒'
    };
    return emojiMap[type] || '📍';
}

// 打开照片模态框
function openPhotoModal(currentPhoto, allPhotos, currentIndex) {
    // 创建照片查看器模态框
    const modal = document.createElement('div');
    modal.className = 'photo-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;

    const photosArray = allPhotos.split(',');
    let currentIdx = currentIndex;

    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
        position: relative;
        max-width: 90%;
        max-height: 90%;
        display: flex;
        align-items: center;
        justify-content: center;
    `;

    const img = document.createElement('img');
    img.src = currentPhoto;
    img.style.cssText = `
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
        border-radius: 8px;
    `;

    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '×';
    closeBtn.style.cssText = `
        position: absolute;
        top: -40px;
        right: 0;
        background: none;
        border: none;
        color: white;
        font-size: 30px;
        cursor: pointer;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
    `;

    modalContent.appendChild(img);
    modalContent.appendChild(closeBtn);

    // 如果有多张照片，添加导航按钮
    if (photosArray.length > 1) {
        const prevBtn = document.createElement('button');
        prevBtn.innerHTML = '‹';
        prevBtn.style.cssText = `
            position: absolute;
            left: -50px;
            top: 50%;
            transform: translateY(-50%);
            background: rgba(255, 255, 255, 0.2);
            border: none;
            color: white;
            font-size: 24px;
            cursor: pointer;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        const nextBtn = document.createElement('button');
        nextBtn.innerHTML = '›';
        nextBtn.style.cssText = prevBtn.style.cssText.replace('left: -50px', 'right: -50px');

        prevBtn.onclick = () => {
            currentIdx = (currentIdx - 1 + photosArray.length) % photosArray.length;
            img.src = photosArray[currentIdx];
        };

        nextBtn.onclick = () => {
            currentIdx = (currentIdx + 1) % photosArray.length;
            img.src = photosArray[currentIdx];
        };

        modalContent.appendChild(prevBtn);
        modalContent.appendChild(nextBtn);
    }

    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    // 显示动画
    setTimeout(() => {
        modal.style.opacity = '1';
    }, 10);

    // 关闭功能
    const closeModal = () => {
        modal.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(modal);
        }, 300);
    };

    closeBtn.onclick = closeModal;
    modal.onclick = (e) => {
        if (e.target === modal) {
            closeModal();
        }
    };

    // 键盘导航
    const handleKeydown = (e) => {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', handleKeydown);
        } else if (e.key === 'ArrowLeft' && photosArray.length > 1) {
            currentIdx = (currentIdx - 1 + photosArray.length) % photosArray.length;
            img.src = photosArray[currentIdx];
        } else if (e.key === 'ArrowRight' && photosArray.length > 1) {
            currentIdx = (currentIdx + 1) % photosArray.length;
            img.src = photosArray[currentIdx];
        }
    };

    document.addEventListener('keydown', handleKeydown);
}

// 照片滑动功能已移除，现在使用静态网格布局

// 指示器和导航按钮相关函数已移除，现在使用静态网格布局

// 打开卡片详情弹框
function openCardModal(index) {
    const place = timelineState.originalPlaces[index];
    if (!place) return;
    
    const modal = document.getElementById('cardModal');
    const modalContent = document.getElementById('cardModalContent');
    const title = document.getElementById('cardModalTitle');
    const date = document.getElementById('cardModalDate');
    const photos = document.getElementById('cardModalPhotos');
    const story = document.getElementById('cardModalStory');
    const tags = document.getElementById('cardModalTags');
    
    // 设置内容
    const emoji = getCityEmoji(place.city);
    title.textContent = `${emoji} ${place.city}`;
    
    // 格式化日期
    const dateObj = new Date(place.dateTime);
    date.textContent = dateObj.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    // 生成照片网格 - 使用Tailwind CSS类
    if (place.photos && place.photos.length > 0) {
        photos.innerHTML = `
            <div class="mb-4">
                <div class="flex items-center gap-3 mb-4">
                    <div class="w-8 h-8 bg-gradient-to-r from-pink-500 to-blue-500 rounded-full flex items-center justify-center">
                        <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2z"></path>
                        </svg>
                    </div>
                    <h3 class="text-lg font-semibold text-gray-800">美好瞬间</h3>
                    <span class="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">${place.photos.length} 张照片</span>
                </div>
                <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    ${place.photos.map((photo, index) => `
                        <div class="group relative overflow-hidden rounded-xl bg-gray-100 aspect-square cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-lg" onclick="openPhotoModal('${photo}', '${place.photos.join(',')}', ${index})">
                            <img src="${photo}" alt="旅行照片" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110">
                            <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div class="absolute bottom-2 right-2 w-6 h-6 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <svg class="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                </svg>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    } else {
        photos.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <svg class="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2z"></path>
                </svg>
                <p class="text-sm">暂无照片</p>
            </div>
        `;
    }
    
    // 设置故事内容
    story.textContent = place.story || '暂无故事内容...';
    
    // 生成标签 - 使用Tailwind CSS类
    if (place.tags && place.tags.length > 0) {
        tags.innerHTML = place.tags.map(tag => `
            <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-sm hover:shadow-md transition-shadow duration-200">
                ${tag}
            </span>
        `).join('');
    } else {
        tags.innerHTML = `
            <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-500">
                暂无标签
            </span>
        `;
    }
    
    // 显示弹框并添加动画
    modal.classList.remove('hidden');
    
    // 触发动画
    setTimeout(() => {
        modalContent.classList.remove('scale-95', 'opacity-0');
        modalContent.classList.add('scale-100', 'opacity-100');
    }, 10);
}

// 关闭卡片弹框
function closeCardModal() {
    const modal = document.getElementById('cardModal');
    const modalContent = document.getElementById('cardModalContent');
    
    // 添加关闭动画
    modalContent.classList.remove('scale-100', 'opacity-100');
    modalContent.classList.add('scale-95', 'opacity-0');
    
    // 延迟隐藏模态框
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
}

// ===== 鼠标特效系统 =====

// 特效状态管理
const effectsState = {
    cursorGlow: null,
    cursorTrails: [],
    maxTrails: 8,
    lastClickTime: 0,
    clickCooldown: 500, // 500ms冷却时间
    loveMessages: [
        '慧娟我爱你 💕',
        '慧娟宝贝 💖',
        '我的小公主 👸',
        '永远爱你 💝',
        '慧娟最美 🌸',
        '我的心肝 💗',
        '慧娟甜心 🍯',
        '爱你一万年 💫'
    ]
};

// 初始化鼠标特效
function initMouseEffects() {
    // 创建鼠标光晕
    createCursorGlow();
    
    // 绑定鼠标事件
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('click', handleMouseClick);
    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchend', handleTouchEnd);
    
    // 为现有元素添加悬浮特效类
    addHoverEffectsToElements();
    
    console.log('鼠标特效系统初始化完成');
}

// 创建鼠标光晕
function createCursorGlow() {
    const glow = document.createElement('div');
    glow.className = 'cursor-glow';
    glow.style.display = 'none';
    document.body.appendChild(glow);
    effectsState.cursorGlow = glow;
}

// 处理鼠标移动
function handleMouseMove(e) {
    // 更新光晕位置
    if (effectsState.cursorGlow) {
        effectsState.cursorGlow.style.display = 'block';
        effectsState.cursorGlow.style.left = e.clientX + 'px';
        effectsState.cursorGlow.style.top = e.clientY + 'px';
    }
    
    // 创建拖尾效果
    createCursorTrail(e.clientX, e.clientY);
    
    // 随机生成魔法粉尘
    if (Math.random() < 0.1) { // 10%概率
        createMagicDust(e.clientX, e.clientY);
    }
}

// 处理鼠标点击
function handleMouseClick(e) {
    const currentTime = Date.now();
    
    // 检查冷却时间
    if (currentTime - effectsState.lastClickTime < effectsState.clickCooldown) {
        return;
    }
    
    effectsState.lastClickTime = currentTime;
    
    // 创建点击特效
    createClickEffects(e.clientX, e.clientY);
    
    // 为点击的元素添加波纹效果
    addRippleEffect(e);
}

// 处理触摸开始
function handleTouchStart(e) {
    if (e.touches.length > 0) {
        const touch = e.touches[0];
        createMagicDust(touch.clientX, touch.clientY);
    }
}

// 处理触摸结束
function handleTouchEnd(e) {
    if (e.changedTouches.length > 0) {
        const touch = e.changedTouches[0];
        createClickEffects(touch.clientX, touch.clientY);
    }
}

// 创建光标拖尾
function createCursorTrail(x, y) {
    // 限制拖尾数量
    if (effectsState.cursorTrails.length >= effectsState.maxTrails) {
        const oldTrail = effectsState.cursorTrails.shift();
        if (oldTrail && oldTrail.parentNode) {
            oldTrail.parentNode.removeChild(oldTrail);
        }
    }
    
    const trail = document.createElement('div');
    trail.className = 'cursor-trail';
    trail.style.left = x + 'px';
    trail.style.top = y + 'px';
    
    document.body.appendChild(trail);
    effectsState.cursorTrails.push(trail);
    
    // 延迟移除拖尾
    setTimeout(() => {
        if (trail.parentNode) {
            trail.style.opacity = '0';
            setTimeout(() => {
                if (trail.parentNode) {
                    trail.parentNode.removeChild(trail);
                }
                const index = effectsState.cursorTrails.indexOf(trail);
                if (index > -1) {
                    effectsState.cursorTrails.splice(index, 1);
                }
            }, 300);
        }
    }, 200);
}

// 创建点击特效组合
function createClickEffects(x, y) {
    // 创建彩虹光环
    createRainbowRing(x, y);
    
    // 创建爱心粒子
    createLoveParticles(x, y);
    
    // 创建星星爆炸
    createStarBurst(x, y);
    
    // 创建"慧娟我爱你"文字特效
    createLoveTextEffect(x, y);
    
    // 创建额外的魔法粉尘
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            const offsetX = (Math.random() - 0.5) * 100;
            const offsetY = (Math.random() - 0.5) * 100;
            createMagicDust(x + offsetX, y + offsetY);
        }, i * 100);
    }
}

// 创建彩虹光环
function createRainbowRing(x, y) {
    const ring = document.createElement('div');
    ring.className = 'rainbow-ring';
    ring.style.left = x + 'px';
    ring.style.top = y + 'px';
    
    document.body.appendChild(ring);
    
    setTimeout(() => {
        if (ring.parentNode) {
            ring.parentNode.removeChild(ring);
        }
    }, 1500);
}

// 创建爱心粒子
function createLoveParticles(x, y) {
    const hearts = ['💕', '💖', '💗', '💝', '💘', '💞', '💓', '💟'];
    const particleCount = 6;
    
    for (let i = 0; i < particleCount; i++) {
        setTimeout(() => {
            const particle = document.createElement('div');
            particle.className = 'love-particle';
            particle.textContent = hearts[Math.floor(Math.random() * hearts.length)];
            
            // 随机位置偏移
            const offsetX = (Math.random() - 0.5) * 80;
            const offsetY = (Math.random() - 0.5) * 80;
            
            particle.style.left = (x + offsetX) + 'px';
            particle.style.top = (y + offsetY) + 'px';
            
            document.body.appendChild(particle);
            
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, 2000);
        }, i * 100);
    }
}

// 创建星星爆炸
function createStarBurst(x, y) {
    const stars = ['⭐', '✨', '🌟', '💫', '⚡', '🎆', '🎇'];
    const starCount = 8;
    
    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.className = 'star-burst';
        star.textContent = stars[Math.floor(Math.random() * stars.length)];
        
        // 圆形分布
        const angle = (i / starCount) * 2 * Math.PI;
        const radius = 30 + Math.random() * 20;
        const offsetX = Math.cos(angle) * radius;
        const offsetY = Math.sin(angle) * radius;
        
        star.style.left = (x + offsetX) + 'px';
        star.style.top = (y + offsetY) + 'px';
        
        document.body.appendChild(star);
        
        setTimeout(() => {
            if (star.parentNode) {
                star.parentNode.removeChild(star);
            }
        }, 1200);
    }
}

// 创建"慧娟我爱你"文字特效
function createLoveTextEffect(x, y) {
    const message = effectsState.loveMessages[Math.floor(Math.random() * effectsState.loveMessages.length)];
    
    const textElement = document.createElement('div');
    textElement.className = 'love-text-effect';
    textElement.textContent = message;
    
    // 随机位置偏移，避免重叠
    const offsetX = (Math.random() - 0.5) * 100;
    const offsetY = -20 + (Math.random() - 0.5) * 40;
    
    textElement.style.left = (x + offsetX) + 'px';
    textElement.style.top = (y + offsetY) + 'px';
    
    document.body.appendChild(textElement);
    
    setTimeout(() => {
        if (textElement.parentNode) {
            textElement.parentNode.removeChild(textElement);
        }
    }, 3000);
}

// 创建魔法粉尘
function createMagicDust(x, y) {
    const dust = document.createElement('div');
    dust.className = 'magic-dust';
    
    // 随机位置偏移
    const offsetX = (Math.random() - 0.5) * 20;
    const offsetY = (Math.random() - 0.5) * 20;
    
    dust.style.left = (x + offsetX) + 'px';
    dust.style.top = (y + offsetY) + 'px';
    
    // 随机移动方向
    const moveX = (Math.random() - 0.5) * 100;
    const moveY = -50 - Math.random() * 50;
    
    dust.style.setProperty('--move-x', moveX + 'px');
    dust.style.setProperty('--move-y', moveY + 'px');
    
    document.body.appendChild(dust);
    
    setTimeout(() => {
        if (dust.parentNode) {
            dust.parentNode.removeChild(dust);
        }
    }, 2000);
}

// 添加波纹效果
function addRippleEffect(e) {
    const target = e.target.closest('.ripple-effect');
    if (!target) return;
    
    const rect = target.getBoundingClientRect();
    const ripple = document.createElement('div');
    ripple.className = 'ripple';
    
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    
    target.appendChild(ripple);
    
    setTimeout(() => {
        if (ripple.parentNode) {
            ripple.parentNode.removeChild(ripple);
        }
    }, 600);
}

// 为现有元素添加悬浮特效类
function addHoverEffectsToElements() {
    // 为统计卡片添加特效
    const statsCards = document.querySelectorAll('.stats-card');
    statsCards.forEach(card => {
        card.classList.add('hover-effect', 'ripple-effect');
    });
    
    // 为时间线卡片添加特效
    const timelineCards = document.querySelectorAll('.timeline-content');
    timelineCards.forEach(card => {
        card.classList.add('hover-effect', 'ripple-effect');
    });
    
    // 为按钮添加特效
    const buttons = document.querySelectorAll('button, .btn');
    buttons.forEach(btn => {
        btn.classList.add('hover-effect', 'ripple-effect');
    });
    
    // 为筛选按钮添加特效
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.classList.add('hover-glow', 'ripple-effect');
    });
    
    // 为标题添加悬浮光效（排除h1, h2）
    const titles = document.querySelectorAll('h3');
    titles.forEach(title => {
        title.classList.add('hover-glow');
    });
    
    // 为地图容器添加特效
    const mapContainer = document.querySelector('#map');
    if (mapContainer) {
        mapContainer.parentElement.classList.add('hover-effect');
    }
}

// 清理特效元素
function cleanupEffects() {
    // 清理光标拖尾
    effectsState.cursorTrails.forEach(trail => {
        if (trail.parentNode) {
            trail.parentNode.removeChild(trail);
        }
    });
    effectsState.cursorTrails = [];
    
    // 清理光晕
    if (effectsState.cursorGlow && effectsState.cursorGlow.parentNode) {
        effectsState.cursorGlow.parentNode.removeChild(effectsState.cursorGlow);
        effectsState.cursorGlow = null;
    }
}

// 在页面卸载时清理特效
window.addEventListener('beforeunload', cleanupEffects);

// 检测设备类型并初始化特效
function initEffectsBasedOnDevice() {
    // 检测是否为触摸设备
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    if (!isTouchDevice) {
        // 只在非触摸设备上启用完整的鼠标特效
        initMouseEffects();
    } else {
        // 触摸设备只启用点击特效
        document.addEventListener('touchend', handleTouchEnd);
        addHoverEffectsToElements();
    }
}

// 在DOM加载完成后初始化特效
document.addEventListener('DOMContentLoaded', function() {
    // 延迟初始化特效，确保页面完全加载
    setTimeout(() => {
        initEffectsBasedOnDevice();
        console.log('特效系统已启动 ✨');
    }, 1000);
    
    // 初始化城市列表弹框功能
    initCityListModal();
});

// ===== 城市列表弹框功能 =====

// 城市列表弹框状态
let cityListModal = null;
let cityListData = [];

// 初始化城市列表弹框
function initCityListModal() {
    cityListModal = document.getElementById('cityListModal');
    
    // 绑定关闭按钮事件
    const closeBtn = document.querySelector('.city-list-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', hideCityListModal);
    }
    
    // 绑定模态框背景点击关闭事件
    if (cityListModal) {
        cityListModal.addEventListener('click', (e) => {
            if (e.target === cityListModal) {
                hideCityListModal();
            }
        });
    }
    
    // 绑定ESC键关闭事件
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && cityListModal && cityListModal.style.display === 'block') {
            hideCityListModal();
        }
    });
}

// 显示城市列表弹框
function showCityListModal() {
    if (!cityListModal || !places || places.length === 0) {
        console.warn('城市数据未加载或弹框元素不存在');
        return;
    }
    
    // 准备城市数据
    prepareCityListData();
    
    // 更新弹框内容
    updateCityListContent();
    
    // 显示弹框
    cityListModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // 添加显示动画
    setTimeout(() => {
        cityListModal.classList.add('show');
    }, 10);
}

// 隐藏城市列表弹框
function hideCityListModal() {
    if (!cityListModal) return;
    
    cityListModal.classList.remove('show');
    
    setTimeout(() => {
        cityListModal.style.display = 'none';
        document.body.style.overflow = '';
    }, 300);
}

// 准备城市列表数据
function prepareCityListData() {
    if (!places) return;
    
    // 按国家分组并排序
    const groupedByCountry = {};
    
    places.forEach(place => {
        const country = place.country || '未知国家';
        if (!groupedByCountry[country]) {
            groupedByCountry[country] = [];
        }
        groupedByCountry[country].push(place);
    });
    
    // 转换为数组并排序
    cityListData = Object.keys(groupedByCountry)
        .sort()
        .map(country => ({
            country,
            cities: groupedByCountry[country].sort((a, b) => a.city.localeCompare(b.city))
        }));
}

// 更新城市列表内容
function updateCityListContent() {
    if (!cityListData || cityListData.length === 0) return;
    
    // 计算统计数据
    const totalCities = places.length;
    const totalCountries = cityListData.length;
    
    // 更新统计信息
    const totalCitiesElement = document.getElementById('totalCities');
    const totalCountriesElement = document.getElementById('totalCountries');
    
    if (totalCitiesElement) {
        totalCitiesElement.textContent = totalCities;
    }
    if (totalCountriesElement) {
        totalCountriesElement.textContent = totalCountries;
    }
    
    // 生成城市列表容器
    const cityContainer = document.getElementById('cityListContainer');
    if (!cityContainer) return;
    
    // 按国家分组显示城市
    cityContainer.innerHTML = '';
    
    // 为每个国家创建一个分组
    cityListData.forEach(countryData => {
        const countrySection = createCountrySection(countryData);
        cityContainer.appendChild(countrySection);
    });
}

// 创建国家分组
function createCountrySection(countryData) {
    const section = document.createElement('div');
    section.className = 'country-section';
    
    // 获取国家旗帜
    const flag = getCountryFlag(countryData.country);
    
    section.innerHTML = `
        <div class="country-section-header">
            <div class="country-flag">${flag}</div>
            <h3 class="country-section-title">${countryData.country}</h3>
            <span class="country-section-count">${countryData.cities.length} 个城市</span>
        </div>
        <div class="country-cities-grid"></div>
    `;
    
    // 添加城市卡片
    const citiesGrid = section.querySelector('.country-cities-grid');
    countryData.cities.forEach(place => {
        const cityCard = createCityCard(place);
        citiesGrid.appendChild(cityCard);
    });
    
    return section;
}

// 创建城市卡片
function createCityCard(place) {
    const card = document.createElement('div');
    card.className = 'city-card';
    
    // 格式化日期
    const date = new Date(place.dateTime || place.date);
    const formattedDate = date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    // 获取照片数量
    const photoCount = place.photos ? place.photos.length : 0;
    
    // 生成标签
    const tagsHtml = place.tags && place.tags.length > 0 
        ? place.tags.map(tag => `<span class="city-tag">${tag}</span>`).join('')
        : '<span class="city-tag">无标签</span>';
    
    // 根据类型选择表情符号
    const typeEmojis = {
        'city': '🏙️',
        'nature': '🌿',
        'beach': '🏖️',
        'mountain': '⛰️',
        'historical': '🏛️',
        'cultural': '🎭',
        'culture': '🎭',
        'food': '🍜',
        'shopping': '🛍️',
        'romantic': '💕',
        'adventure': '🎒'
    };
    const emoji = typeEmojis[place.type] || '📍';
    
    card.innerHTML = `
        <div class="city-card-content">
            <div class="city-card-header">
                <div class="city-emoji">${emoji}</div>
                <div class="city-info">
                    <h3 class="city-name">${place.city}</h3>
                    <p class="city-date">${formattedDate}</p>
                </div>
            </div>
            
            <div class="city-story">${place.story || '暂无故事描述...'}</div>
            
            <div class="city-tags">
                ${tagsHtml}
            </div>
            
            <div class="city-card-footer">
                <div class="city-photos-count">
                    📸 ${photoCount} 张照片
                </div>
                <button class="city-view-btn" onclick="viewCityDetails('${place.city}')">
                    查看详情
                </button>
            </div>
        </div>
    `;
    
    // 添加点击事件
    card.addEventListener('click', (e) => {
        // 如果点击的是按钮，不触发卡片点击事件
        if (e.target.classList.contains('city-view-btn')) {
            return;
        }
        viewCityDetails(place.city);
    });
    
    return card;
}

// 查看城市详情
function viewCityDetails(cityName) {
    // 关闭城市列表弹框
    hideCityListModal();
    
    // 关闭国家列表弹框
    hideCountryListModal();
    
    // 查找对应的城市数据
    const place = places.find(p => p.city === cityName);
    if (!place) {
        console.warn('未找到城市数据:', cityName);
        return;
    }
    
    // 显示城市详情（复用现有的卡片详情功能）
    setTimeout(() => {
        showCardDetail(place);
    }, 300);
    
    // 如果地图上有对应的标记，跳转到该位置
    if (place.lat && place.lng && map) {
        setTimeout(() => {
            map.setView([place.lat, place.lng], 12);
        }, 500);
    }
}

// ===== 统计卡片点击功能 =====

// 初始化统计卡片点击事件
function initStatsCardEvents() {
    // 城市统计卡片
    const cityStatsCard = document.getElementById('cityStatsCard');
    if (cityStatsCard) {
        cityStatsCard.addEventListener('click', showCityListModal);
    }
    
    // 国家统计卡片
    const countryStatsCard = document.getElementById('countryStatsCard');
    if (countryStatsCard) {
        countryStatsCard.addEventListener('click', showCountryListModal);
    }
    
    // 回忆统计卡片
    const memoryStatsCard = document.getElementById('memoryStatsCard');
    if (memoryStatsCard) {
        memoryStatsCard.addEventListener('click', showMemoryListModal);
    }
}

// ===== 国家列表弹框功能 =====

let countryListModal = null;
let countryListData = [];

// 初始化国家列表弹框
function initCountryListModal() {
    countryListModal = document.getElementById('countryListModal');
    
    // 绑定关闭按钮事件
    const closeBtn = document.querySelector('.country-list-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', hideCountryListModal);
    }
    
    // 绑定模态框背景点击关闭事件
    if (countryListModal) {
        countryListModal.addEventListener('click', (e) => {
            if (e.target === countryListModal) {
                hideCountryListModal();
            }
        });
    }
}

// 显示国家列表弹框
function showCountryListModal() {
    if (!countryListModal || !places || places.length === 0) {
        console.warn('国家数据未加载或弹框元素不存在');
        return;
    }
    
    // 准备国家数据
    prepareCountryListData();
    
    // 更新弹框内容
    updateCountryListContent();
    
    // 显示弹框
    countryListModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // 添加显示动画
    setTimeout(() => {
        countryListModal.classList.add('show');
    }, 10);
}

// 隐藏国家列表弹框
function hideCountryListModal() {
    if (!countryListModal) return;
    
    countryListModal.classList.remove('show');
    
    setTimeout(() => {
        countryListModal.style.display = 'none';
        document.body.style.overflow = '';
    }, 300);
}

// 准备国家列表数据
function prepareCountryListData() {
    if (!places) return;
    
    // 按国家分组
    const groupedByCountry = {};
    
    places.forEach(place => {
        const country = place.country || '未知国家';
        if (!groupedByCountry[country]) {
            groupedByCountry[country] = [];
        }
        groupedByCountry[country].push(place);
    });
    
    // 转换为数组并排序
    countryListData = Object.keys(groupedByCountry)
        .sort()
        .map(country => ({
            country,
            cities: groupedByCountry[country].sort((a, b) => a.city.localeCompare(b.city)),
            flag: getCountryFlag(country)
        }));
}

// 获取国家旗帜表情符号
function getCountryFlag(country) {
    const flagMap = {
        '中国': '🇨🇳',
        '中国台湾': '🇹🇼',
        '日本': '🇯🇵',
        '韩国': '🇰🇷',
        '新加坡': '🇸🇬',
        '泰国': '🇹🇭',
        '美国': '🇺🇸',
        '英国': '🇬🇧',
        '法国': '🇫🇷',
        '德国': '🇩🇪',
        '意大利': '🇮🇹',
        '西班牙': '🇪🇸',
        '澳大利亚': '🇦🇺',
        '加拿大': '🇨🇦'
    };
    return flagMap[country] || '🌍';
}

// 更新国家列表内容
function updateCountryListContent() {
    if (!countryListData || countryListData.length === 0) return;
    
    // 计算统计数据
    const totalCountries = countryListData.length;
    const totalCities = places.length;
    
    // 更新统计信息
    const totalCountriesElement = document.getElementById('totalCountriesInModal');
    const totalCitiesElement = document.getElementById('totalCitiesInModal');
    
    if (totalCountriesElement) {
        totalCountriesElement.textContent = totalCountries;
    }
    if (totalCitiesElement) {
        totalCitiesElement.textContent = totalCities;
    }
    
    // 生成国家网格
    const countryContainer = document.getElementById('countryListContainer');
    if (!countryContainer) return;
    
    countryContainer.innerHTML = '<div class="country-grid"></div>';
    const countryGrid = countryContainer.querySelector('.country-grid');
    
    // 为每个国家创建卡片
    countryListData.forEach(countryData => {
        const countryCard = createCountryCard(countryData);
        countryGrid.appendChild(countryCard);
    });
}

// 创建国家卡片
function createCountryCard(countryData) {
    const card = document.createElement('div');
    card.className = 'country-card';
    
    const citiesHtml = countryData.cities
        .map(city => `<span class="country-city-tag" onclick="viewCityDetails('${city.city}')">${city.city}</span>`)
        .join('');
    
    card.innerHTML = `
        <div class="country-card-content">
            <div class="country-card-header">
                <div class="country-flag">${countryData.flag}</div>
                <div class="country-info">
                    <h3 class="country-name">${countryData.country}</h3>
                    <p class="country-cities-count">${countryData.cities.length} 个城市</p>
                </div>
            </div>
            
            <div class="country-cities-list">
                <div class="country-cities-title">去过的城市：</div>
                <div class="country-cities">
                    ${citiesHtml}
                </div>
            </div>
        </div>
    `;
    
    return card;
}

// ===== 回忆列表弹框功能 =====

let memoryListModal = null;

// 初始化回忆列表弹框
function initMemoryListModal() {
    memoryListModal = document.getElementById('memoryListModal');
    
    // 绑定关闭按钮事件
    const closeBtn = document.querySelector('.memory-list-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', hideMemoryListModal);
    }
    
    // 绑定模态框背景点击关闭事件
    if (memoryListModal) {
        memoryListModal.addEventListener('click', (e) => {
            if (e.target === memoryListModal) {
                hideMemoryListModal();
            }
        });
    }
}

// 显示回忆列表弹框
function showMemoryListModal() {
    if (!memoryListModal || !places || places.length === 0) {
        console.warn('回忆数据未加载或弹框元素不存在');
        return;
    }
    
    // 更新弹框内容
    updateMemoryListContent();
    
    // 显示弹框
    memoryListModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // 添加显示动画
    setTimeout(() => {
        memoryListModal.classList.add('show');
    }, 10);
}

// 隐藏回忆列表弹框
function hideMemoryListModal() {
    if (!memoryListModal) return;
    
    memoryListModal.classList.remove('show');
    
    setTimeout(() => {
        memoryListModal.style.display = 'none';
        document.body.style.overflow = '';
    }, 300);
}

// 更新回忆列表内容
function updateMemoryListContent() {
    if (!places || places.length === 0) return;
    
    // 计算统计数据
    const totalMemories = places.length;
    const totalPhotos = places.reduce((sum, place) => sum + (place.photos ? place.photos.length : 0), 0);
    
    // 更新统计信息
    const totalMemoriesElement = document.getElementById('totalMemories');
    const totalPhotosElement = document.getElementById('totalPhotos');
    
    if (totalMemoriesElement) {
        totalMemoriesElement.textContent = totalMemories;
    }
    if (totalPhotosElement) {
        totalPhotosElement.textContent = totalPhotos;
    }
    
    // 生成回忆网格
    const memoryContainer = document.getElementById('memoryListContainer');
    if (!memoryContainer) return;
    
    memoryContainer.innerHTML = '<div class="memory-grid"></div>';
    const memoryGrid = memoryContainer.querySelector('.memory-grid');
    
    // 按时间排序回忆
    const sortedPlaces = [...places].sort((a, b) => {
        const dateA = new Date(a.dateTime || a.date);
        const dateB = new Date(b.dateTime || b.date);
        return dateB - dateA; // 最新的在前
    });
    
    // 为每个回忆创建卡片
    sortedPlaces.forEach((place, index) => {
        const memoryCard = createMemoryCard(place, index);
        memoryGrid.appendChild(memoryCard);
    });
}

// 创建回忆卡片
function createMemoryCard(place, index) {
    const card = document.createElement('div');
    card.className = 'memory-card';
    
    // 格式化日期
    const date = new Date(place.dateTime || place.date);
    const formattedDate = date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    // 获取照片数量
    const photoCount = place.photos ? place.photos.length : 0;
    
    // 生成标签
    const tagsHtml = place.tags && place.tags.length > 0 
        ? place.tags.map(tag => `<span class="memory-tag">${tag}</span>`).join('')
        : '<span class="memory-tag">无标签</span>';
    
    // 根据类型选择表情符号
    const typeEmojis = {
        'city': '🏙️',
        'nature': '🌿',
        'beach': '🏖️',
        'mountain': '⛰️',
        'historical': '🏛️',
        'cultural': '🎭',
        'culture': '🎭',
        'food': '🍜',
        'shopping': '🛍️',
        'romantic': '💕',
        'adventure': '🎒'
    };
    const emoji = typeEmojis[place.type] || '💝';
    
    card.innerHTML = `
        <div class="memory-card-content">
            <div class="memory-card-header">
                <div class="memory-emoji">${emoji}</div>
                <div class="memory-info">
                    <h3 class="memory-city">${place.city}</h3>
                    <p class="memory-date">${formattedDate}</p>
                </div>
            </div>
            
            <div class="memory-story">${place.story || '暂无故事描述...'}</div>
            
            <div class="memory-tags">
                ${tagsHtml}
            </div>
            
            <div class="memory-card-footer">
                <div class="memory-photos-count">
                    📸 ${photoCount} 张照片
                </div>
                <button class="memory-view-btn" onclick="openCardModal(${index})">
                    查看详情
                </button>
            </div>
        </div>
    `;
    
    // 添加点击事件
    card.addEventListener('click', (e) => {
        // 如果点击的是按钮，不触发卡片点击事件
        if (e.target.classList.contains('memory-view-btn')) {
            return;
        }
        openCardModal(index);
    });
    
    return card;
}

// 添加ESC键关闭所有弹框的事件监听
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        // 关闭所有弹框
        const cardModal = document.getElementById('cardModal');
        if (cardModal && cardModal.style.display === 'block') {
            closeCardModal();
        }
        if (cityListModal && cityListModal.style.display === 'block') {
            hideCityListModal();
        }
        if (countryListModal && countryListModal.style.display === 'block') {
            hideCountryListModal();
        }
        if (memoryListModal && memoryListModal.style.display === 'block') {
            hideMemoryListModal();
        }
    }
});