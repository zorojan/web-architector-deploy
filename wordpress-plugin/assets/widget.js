/**
 * SDH AI Assistant Widget - WordPress Plugin JavaScript
 */

(function() {
    'use strict';
    
    // Проверяем доступность настроек
    if (typeof sdhAiSettings === 'undefined') {
        console.error('SDH AI Assistant: Settings not found');
        return;
    }
    
    var settings = sdhAiSettings;
    var widget = null;
    var isMinimized = false;
    
    // Объект для управления виджетом
    window.sdhAiWidget = {
        
        /**
         * Инициализация виджета
         */
        init: function() {
            if (!settings || !settings.widgetUrl) {
                console.error('SDH AI Assistant: Invalid settings');
                return;
            }
            
            this.createWidget();
            this.bindEvents();
            
            // Автоматическое открытие если включено
            if (settings.autoOpen) {
                setTimeout(function() {
                    sdhAiWidget.show();
                }, 2000);
            }
        },
        
        /**
         * Создание виджета
         */
        createWidget: function() {
            // Создаем контейнер
            var container = document.createElement('div');
            container.id = 'sdh-ai-floating-widget';
            container.className = 'sdh-ai-widget-container';
            
            if (settings.position === 'bottom-left') {
                container.classList.add('position-left');
            }
            
            // Проверяем мобильные устройства
            if (!settings.showOnMobile && this.isMobile()) {
                container.style.display = 'none';
                return;
            }
            
            // Создаем iframe
            var iframe = document.createElement('iframe');
            iframe.src = this.buildWidgetUrl();
            iframe.style.width = '100%';
            iframe.style.height = '100%';
            iframe.style.border = 'none';
            iframe.style.borderRadius = '12px';
            iframe.frameBorder = '0';
            iframe.allowTransparency = 'true';
            iframe.setAttribute('aria-label', settings.title || 'AI Assistant Chat');
            
            container.appendChild(iframe);
            document.body.appendChild(container);
            
            widget = container;
            
            // Изначально скрыт
            this.hide();
            
            // Добавляем кнопку открытия/закрытия
            this.addToggleButton();
        },
        
        /**
         * Создание URL виджета
         */
        buildWidgetUrl: function() {
            var params = {
                agentId: settings.agentId || 'devops-specialist',
                theme: settings.theme || 'light',
                position: 'floating',
                title: settings.title || 'AI Assistant',
                placeholder: settings.placeholder || 'Type your message...',
                primaryColor: settings.primaryColor || '#4F7FFF',
                apiUrl: settings.apiUrl || 'http://localhost:3001',
                wp: '1' // Указываем что это WordPress
            };
            
            var queryString = Object.keys(params)
                .map(function(key) {
                    return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
                })
                .join('&');
                
            return settings.widgetUrl + '/widget.html?' + queryString;
        },
        
        /**
         * Добавление кнопки переключения
         */
        addToggleButton: function() {
            var button = document.createElement('div');
            button.id = 'sdh-ai-toggle-button';
            button.innerHTML = '💬';
            button.style.cssText = `
                position: fixed;
                bottom: 20px;
                ${settings.position === 'bottom-left' ? 'left' : 'right'}: 20px;
                width: 60px;
                height: 60px;
                background: ${settings.primaryColor || '#4F7FFF'};
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                z-index: 9998;
                font-size: 24px;
                transition: all 0.3s ease;
                user-select: none;
            `;
            
            button.addEventListener('click', this.toggle.bind(this));
            button.addEventListener('mouseenter', function() {
                this.style.transform = 'scale(1.1)';
                this.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.2)';
            });
            button.addEventListener('mouseleave', function() {
                this.style.transform = 'scale(1)';
                this.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
            });
            
            document.body.appendChild(button);
        },
        
        /**
         * Привязка событий
         */
        bindEvents: function() {
            // Слушаем сообщения от iframe
            window.addEventListener('message', this.handleMessage.bind(this));
            
            // Обработка изменения размера окна
            window.addEventListener('resize', this.handleResize.bind(this));
            
            // Обработка клавиш
            document.addEventListener('keydown', this.handleKeydown.bind(this));
        },
        
        /**
         * Обработка сообщений от iframe
         */
        handleMessage: function(event) {
            if (event.origin !== settings.widgetUrl.replace(/\/$/, '')) {
                return;
            }
            
            var data = event.data;
            
            switch (data.type) {
                case 'sdh-ai-widget-resize':
                    if (widget && data.height) {
                        widget.style.height = data.height + 'px';
                    }
                    break;
                    
                case 'sdh-ai-widget-minimize':
                    this.minimize();
                    break;
                    
                case 'sdh-ai-widget-close':
                    this.hide();
                    break;
                    
                case 'sdh-ai-widget-notification':
                    this.showNotification(data.message, data.level);
                    break;
            }
        },
        
        /**
         * Обработка изменения размера
         */
        handleResize: function() {
            if (this.isMobile() && !settings.showOnMobile) {
                this.hide();
            } else if (!this.isMobile() || settings.showOnMobile) {
                // Адаптируем размеры для мобильных
                if (widget && this.isMobile()) {
                    widget.style.width = 'calc(100vw - 40px)';
                    widget.style.height = '500px';
                    widget.style.maxWidth = '400px';
                } else if (widget) {
                    widget.style.width = '400px';
                    widget.style.height = '600px';
                }
            }
        },
        
        /**
         * Обработка клавиш
         */
        handleKeydown: function(event) {
            // ESC для закрытия
            if (event.key === 'Escape' && widget && widget.style.display !== 'none') {
                this.hide();
            }
        },
        
        /**
         * Показать виджет
         */
        show: function() {
            if (widget) {
                widget.style.display = 'block';
                isMinimized = false;
                
                // Фокус на iframe для доступности
                var iframe = widget.querySelector('iframe');
                if (iframe) {
                    iframe.focus();
                }
            }
        },
        
        /**
         * Скрыть виджет
         */
        hide: function() {
            if (widget) {
                widget.style.display = 'none';
                isMinimized = false;
            }
        },
        
        /**
         * Переключить видимость
         */
        toggle: function() {
            if (!widget) return;
            
            if (widget.style.display === 'none') {
                this.show();
            } else {
                this.hide();
            }
        },
        
        /**
         * Минимизировать виджет
         */
        minimize: function() {
            if (widget) {
                widget.classList.add('minimized');
                isMinimized = true;
            }
        },
        
        /**
         * Показать уведомление
         */
        showNotification: function(message, level) {
            var notification = document.createElement('div');
            notification.className = 'sdh-ai-notification ' + (level || 'info');
            notification.textContent = message;
            
            document.body.appendChild(notification);
            
            // Автоматическое скрытие через 5 секунд
            setTimeout(function() {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 5000);
            
            // Клик для закрытия
            notification.addEventListener('click', function() {
                if (this.parentNode) {
                    this.parentNode.removeChild(this);
                }
            });
        },
        
        /**
         * Проверка мобильного устройства
         */
        isMobile: function() {
            return window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        },
        
        /**
         * Получить настройки
         */
        getSettings: function() {
            return settings;
        },
        
        /**
         * Обновить настройки
         */
        updateSettings: function(newSettings) {
            settings = Object.assign(settings, newSettings);
            
            // Пересоздаем виджет с новыми настройками
            if (widget) {
                var wasVisible = widget.style.display !== 'none';
                this.destroy();
                this.createWidget();
                if (wasVisible) {
                    this.show();
                }
            }
        },
        
        /**
         * Уничтожить виджет
         */
        destroy: function() {
            if (widget && widget.parentNode) {
                widget.parentNode.removeChild(widget);
                widget = null;
            }
            
            var button = document.getElementById('sdh-ai-toggle-button');
            if (button && button.parentNode) {
                button.parentNode.removeChild(button);
            }
        }
    };
    
    // Автоматическая инициализация при загрузке DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            sdhAiWidget.init();
        });
    } else {
        sdhAiWidget.init();
    }
    
})();
