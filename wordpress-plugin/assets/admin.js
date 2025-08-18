/**
 * SDH AI Assistant - Admin JavaScript
 */

(function($) {
    'use strict';

    var SdhAiAdmin = {
        
        /**
         * Инициализация
         */
        init: function() {
            this.bindEvents();
            this.initTabs();
            this.testApiConnection();
            this.updatePreview();
        },

        /**
         * Привязка событий
         */
        bindEvents: function() {
            // Переключение табов
            $('.nav-tab').on('click', this.switchTab);
            
            // Тестирование API
            $('#test-api-connection').on('click', this.testApi);
            
            // Обновление превью при изменении настроек
            $('input[name*="sdh_ai_"], select[name*="sdh_ai_"]').on('change input', this.updatePreview);
            
            // Копирование кода
            $(document).on('click', '.copy-code', this.copyCode);
        },

        /**
         * Инициализация табов
         */
        initTabs: function() {
            var hash = window.location.hash;
            var activeTab = 'settings';
            
            if (hash && $(hash).length) {
                activeTab = hash.substring(1);
            }
            
            this.showTab(activeTab);
        },

        /**
         * Переключение табов
         */
        switchTab: function(e) {
            e.preventDefault();
            var tabId = $(this).attr('href').substring(1);
            SdhAiAdmin.showTab(tabId);
            history.pushState(null, null, '#' + tabId);
        },

        /**
         * Показать таб
         */
        showTab: function(tabId) {
            $('.nav-tab').removeClass('nav-tab-active');
            $('.tab-content').removeClass('active');
            
            $('a[href="#' + tabId + '"]').addClass('nav-tab-active');
            $('#' + tabId).addClass('active');
        },

        /**
         * Тестирование API подключения
         */
        testApi: function(e) {
            e.preventDefault();
            
            var $button = $(this);
            var $result = $('#api-test-result');
            var apiUrl = $('#sdh_ai_api_url').val();
            
            if (!apiUrl) {
                SdhAiAdmin.showApiResult('error', 'Пожалуйста, введите URL API сервера');
                return;
            }
            
            $button.prop('disabled', true).text('Тестирование...');
            $result.removeClass('success error').addClass('loading').show();
            $result.html('<span class="sdh-ai-loading-spinner"></span> Проверка подключения к API...');
            
            // Тестируем подключение
            $.ajax({
                url: apiUrl + '/api/test',
                method: 'GET',
                timeout: 10000,
                success: function(response) {
                    SdhAiAdmin.showApiResult('success', 'Подключение к API успешно! Сервер доступен.');
                    SdhAiAdmin.testAgentsEndpoint(apiUrl);
                },
                error: function(xhr, status, error) {
                    var message = 'Ошибка подключения к API';
                    if (status === 'timeout') {
                        message += ': превышено время ожидания';
                    } else if (xhr.status) {
                        message += ': HTTP ' + xhr.status;
                    }
                    SdhAiAdmin.showApiResult('error', message);
                },
                complete: function() {
                    $button.prop('disabled', false).text('Тестировать подключение');
                }
            });
        },

        /**
         * Тестирование эндпоинта агентов
         */
        testAgentsEndpoint: function(apiUrl) {
            $.ajax({
                url: apiUrl + '/api/agents',
                method: 'GET',
                timeout: 5000,
                success: function(response) {
                    var agentsCount = Array.isArray(response) ? response.length : 0;
                    SdhAiAdmin.showApiResult('success', 'API работает корректно! Найдено агентов: ' + agentsCount);
                },
                error: function() {
                    SdhAiAdmin.showApiResult('success', 'Подключение работает, но эндпоинт агентов недоступен');
                }
            });
        },

        /**
         * Показать результат API теста
         */
        showApiResult: function(type, message) {
            var $result = $('#api-test-result');
            $result.removeClass('success error loading').addClass(type).show();
            $result.text(message);
            
            // Автоскрытие через 5 секунд
            setTimeout(function() {
                $result.fadeOut();
            }, 5000);
        },

        /**
         * Обновление превью
         */
        updatePreview: function() {
            var settings = SdhAiAdmin.getSettings();
            var previewUrl = SdhAiAdmin.buildWidgetUrl(settings);
            
            $('#sdh-ai-preview-iframe').attr('src', previewUrl);
            
            // Обновляем код для копирования
            SdhAiAdmin.updateEmbedCode(settings);
        },

        /**
         * Получение текущих настроек
         */
        getSettings: function() {
            return {
                apiUrl: $('#sdh_ai_api_url').val() || 'http://localhost:3001',
                defaultAgent: $('#sdh_ai_default_agent').val() || 'devops-specialist',
                theme: $('#sdh_ai_theme').val() || 'light',
                width: $('#sdh_ai_width').val() || '400',
                height: $('#sdh_ai_height').val() || '600',
                position: $('#sdh_ai_position').val() || 'bottom-right'
            };
        },

        /**
         * Построение URL виджета
         */
        buildWidgetUrl: function(settings) {
            var baseUrl = settings.apiUrl.replace(':3001', ':5173');
            var params = new URLSearchParams({
                agent: settings.defaultAgent,
                theme: settings.theme,
                apiUrl: encodeURIComponent(settings.apiUrl)
            });
            
            return baseUrl + '/widget?' + params.toString();
        },

        /**
         * Обновление кода внедрения
         */
        updateEmbedCode: function(settings) {
            var widgetUrl = this.buildWidgetUrl(settings);
            
            // Шорткод
            var shortcode = '[sdh_ai_widget]';
            if (settings.defaultAgent !== 'devops-specialist') {
                shortcode = '[sdh_ai_widget agent="' + settings.defaultAgent + '"]';
            }
            
            // HTML код
            var htmlCode = '<iframe src="' + widgetUrl + '" ' +
                          'width="' + settings.width + '" ' +
                          'height="' + settings.height + '" ' +
                          'frameborder="0" ' +
                          'style="border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">' +
                          '</iframe>';
            
            // JavaScript код
            var jsCode = 'window.sdhAiConfig = {\n' +
                        '    apiUrl: "' + settings.apiUrl + '",\n' +
                        '    agent: "' + settings.defaultAgent + '",\n' +
                        '    theme: "' + settings.theme + '",\n' +
                        '    width: "' + settings.width + 'px",\n' +
                        '    height: "' + settings.height + 'px",\n' +
                        '    position: "' + settings.position + '"\n' +
                        '};\n\n' +
                        '// Добавляем виджет на страницу\n' +
                        '(function() {\n' +
                        '    var script = document.createElement("script");\n' +
                        '    script.src = "' + settings.apiUrl.replace(':3001', ':5173') + '/assets/widget.js";\n' +
                        '    document.head.appendChild(script);\n' +
                        '})();';
            
            // Обновляем элементы
            $('#shortcode-example').text(shortcode);
            $('#html-example').text(htmlCode);
            $('#js-example').text(jsCode);
        },

        /**
         * Копирование кода
         */
        copyCode: function(e) {
            e.preventDefault();
            
            var targetId = $(this).data('target');
            var $target = $('#' + targetId);
            
            if ($target.length) {
                var text = $target.text();
                
                // Копируем в буфер обмена
                navigator.clipboard.writeText(text).then(function() {
                    SdhAiAdmin.showNotice('Код скопирован в буфер обмена!', 'success');
                }).catch(function() {
                    // Fallback для старых браузеров
                    var textArea = document.createElement('textarea');
                    textArea.value = text;
                    document.body.appendChild(textArea);
                    textArea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textArea);
                    
                    SdhAiAdmin.showNotice('Код скопирован в буфер обмена!', 'success');
                });
            }
        },

        /**
         * Показать уведомление
         */
        showNotice: function(message, type) {
            type = type || 'info';
            
            var $notice = $('<div class="notice sdh-ai-notice notice-' + type + ' is-dismissible">')
                .html('<p>' + message + '</p>');
            
            $('.wrap h1').after($notice);
            
            // Автоудаление через 3 секунды
            setTimeout(function() {
                $notice.fadeOut(function() {
                    $(this).remove();
                });
            }, 3000);
        },

        /**
         * Проверка подключения при загрузке
         */
        testApiConnection: function() {
            var apiUrl = $('#sdh_ai_api_url').val();
            if (!apiUrl) return;
            
            // Простая проверка доступности
            $.ajax({
                url: apiUrl + '/api/test',
                method: 'GET',
                timeout: 3000,
                success: function() {
                    $('.sdh-ai-status')
                        .removeClass('disconnected')
                        .addClass('connected')
                        .find('.status-text')
                        .text('Подключен');
                },
                error: function() {
                    $('.sdh-ai-status')
                        .removeClass('connected')
                        .addClass('disconnected')
                        .find('.status-text')
                        .text('Не подключен');
                }
            });
        }
    };

    // Инициализация при загрузке DOM
    $(document).ready(function() {
        SdhAiAdmin.init();
    });

    // Экспорт в глобальную область для отладки
    window.SdhAiAdmin = SdhAiAdmin;

})(jQuery);
