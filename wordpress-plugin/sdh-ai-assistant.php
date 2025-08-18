<?php
/**
 * Plugin Name: SDH AI Assistant Widget
 * Plugin URI: https://github.com/zorojan/sdh-global-ai-assistant
 * Description: Встраивает AI чат-ассистентов на ваш WordPress сайт. Подключается к SDH Global AI Assistant для предоставления интеллектуальной поддержки пользователям.
 * Version: 1.0.0
 * Author: SDH Global AI Assistant
 * Author URI: https://github.com/zorojan
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: sdh-ai-assistant
 * Domain Path: /languages
 * Requires at least: 5.0
 * Tested up to: 6.3
 * Requires PHP: 7.4
 */

// Запретить прямой доступ
if (!defined('ABSPATH')) {
    exit;
}

// Константы плагина
define('SDH_AI_PLUGIN_VERSION', '1.0.0');
define('SDH_AI_PLUGIN_URL', plugin_dir_url(__FILE__));
define('SDH_AI_PLUGIN_PATH', plugin_dir_path(__FILE__));
define('SDH_AI_PLUGIN_FILE', __FILE__);
define('SDH_AI_PLUGIN_BASENAME', plugin_basename(__FILE__));

// Подключаем основной класс
require_once SDH_AI_PLUGIN_PATH . 'includes/class-sdh-ai-assistant.php';
require_once SDH_AI_PLUGIN_PATH . 'includes/activation.php';

// Инициализируем плагин
function sdh_ai_assistant_init() {
    new SDH_AI_Assistant_Plugin();
}
add_action('plugins_loaded', 'sdh_ai_assistant_init');

// Хук активации
register_activation_hook(__FILE__, 'sdh_ai_assistant_activate');
function sdh_ai_assistant_activate() {
    // Устанавливаем настройки по умолчанию
    add_option('sdh_ai_widget_enabled', false);
    add_option('sdh_ai_agent_id', 'devops-specialist');
    add_option('sdh_ai_theme', 'light');
    add_option('sdh_ai_position', 'bottom-right');
    add_option('sdh_ai_title', 'AI Assistant');
    add_option('sdh_ai_placeholder', 'Введите ваше сообщение...');
    add_option('sdh_ai_primary_color', '#4F7FFF');
    add_option('sdh_ai_api_url', 'http://localhost:3001');
    add_option('sdh_ai_widget_url', 'http://localhost:5173');
    add_option('sdh_ai_show_on_mobile', true);
    add_option('sdh_ai_auto_open', false);
    
    // Очищаем кеш
    flush_rewrite_rules();
}

// Хук деактивации
register_deactivation_hook(__FILE__, 'sdh_ai_assistant_deactivate');
function sdh_ai_assistant_deactivate() {
    // Очищаем кеш
    flush_rewrite_rules();
}

// Хук удаления
register_uninstall_hook(__FILE__, 'sdh_ai_assistant_uninstall');
function sdh_ai_assistant_uninstall() {
    // Удаляем все настройки плагина
    delete_option('sdh_ai_widget_enabled');
    delete_option('sdh_ai_agent_id');
    delete_option('sdh_ai_theme');
    delete_option('sdh_ai_position');
    delete_option('sdh_ai_title');
    delete_option('sdh_ai_placeholder');
    delete_option('sdh_ai_primary_color');
    delete_option('sdh_ai_api_url');
    delete_option('sdh_ai_widget_url');
    delete_option('sdh_ai_show_on_mobile');
    delete_option('sdh_ai_auto_open');
}
