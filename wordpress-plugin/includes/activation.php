<?php
/**
 * Обработчики активации и деактивации плагина
 *
 * @package SdhAiAssistant
 */

// Запрет прямого доступа
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Функция активации плагина
 */
function sdh_ai_assistant_activate() {
    // Создаем опции по умолчанию
    $default_options = array(
        'api_url' => 'http://localhost:3001',
        'default_agent' => 'devops-specialist',
        'theme' => 'light',
        'width' => '400',
        'height' => '600',
        'position' => 'bottom-right',
        'enabled' => true
    );
    
    // Добавляем опции только если их еще нет
    foreach ($default_options as $key => $value) {
        $option_name = 'sdh_ai_' . $key;
        if (get_option($option_name) === false) {
            add_option($option_name, $value);
        }
    }
    
    // Создаем запись в логе об активации
    if (function_exists('error_log')) {
        error_log('SDH AI Assistant plugin activated');
    }
    
    // Добавляем capabilities для администраторов
    $role = get_role('administrator');
    if ($role) {
        $role->add_cap('manage_sdh_ai_assistant');
    }
    
    // Очищаем кеш
    if (function_exists('wp_cache_flush')) {
        wp_cache_flush();
    }
    
    // Устанавливаем флаг для показа welcome сообщения
    set_transient('sdh_ai_assistant_activated', true, 30);
}

/**
 * Функция деактивации плагина
 */
function sdh_ai_assistant_deactivate() {
    // Очищаем временные данные
    delete_transient('sdh_ai_assistant_activated');
    delete_transient('sdh_ai_assistant_api_test_result');
    
    // Создаем запись в логе о деактивации
    if (function_exists('error_log')) {
        error_log('SDH AI Assistant plugin deactivated');
    }
    
    // Удаляем capabilities
    $role = get_role('administrator');
    if ($role) {
        $role->remove_cap('manage_sdh_ai_assistant');
    }
    
    // Очищаем кеш
    if (function_exists('wp_cache_flush')) {
        wp_cache_flush();
    }
    
    // Примечание: настройки НЕ удаляем при деактивации
    // Они будут удалены только при полном удалении плагина
}

/**
 * Функция удаления плагина
 */
function sdh_ai_assistant_uninstall() {
    // Удаляем все опции плагина
    $options = array(
        'sdh_ai_api_url',
        'sdh_ai_default_agent',
        'sdh_ai_theme',
        'sdh_ai_width',
        'sdh_ai_height',
        'sdh_ai_position',
        'sdh_ai_enabled'
    );
    
    foreach ($options as $option) {
        delete_option($option);
    }
    
    // Удаляем временные данные
    delete_transient('sdh_ai_assistant_activated');
    delete_transient('sdh_ai_assistant_api_test_result');
    
    // Удаляем capabilities
    $role = get_role('administrator');
    if ($role) {
        $role->remove_cap('manage_sdh_ai_assistant');
    }
    
    // Создаем запись в логе об удалении
    if (function_exists('error_log')) {
        error_log('SDH AI Assistant plugin uninstalled');
    }
    
    // Очищаем кеш
    if (function_exists('wp_cache_flush')) {
        wp_cache_flush();
    }
}

/**
 * Проверка совместимости при активации
 */
function sdh_ai_assistant_check_compatibility() {
    // Проверяем версию WordPress
    if (version_compare(get_bloginfo('version'), '5.0', '<')) {
        deactivate_plugins(plugin_basename(__FILE__));
        wp_die(
            __('SDH AI Assistant requires WordPress version 5.0 or higher.', 'sdh-ai-assistant'),
            __('Plugin Activation Error', 'sdh-ai-assistant'),
            array('back_link' => true)
        );
    }
    
    // Проверяем версию PHP
    if (version_compare(PHP_VERSION, '7.4', '<')) {
        deactivate_plugins(plugin_basename(__FILE__));
        wp_die(
            __('SDH AI Assistant requires PHP version 7.4 or higher.', 'sdh-ai-assistant'),
            __('Plugin Activation Error', 'sdh-ai-assistant'),
            array('back_link' => true)
        );
    }
    
    // Проверяем наличие необходимых функций
    if (!function_exists('curl_init')) {
        deactivate_plugins(plugin_basename(__FILE__));
        wp_die(
            __('SDH AI Assistant requires cURL PHP extension.', 'sdh-ai-assistant'),
            __('Plugin Activation Error', 'sdh-ai-assistant'),
            array('back_link' => true)
        );
    }
}

/**
 * Создание welcome сообщения после активации
 */
function sdh_ai_assistant_show_activation_notice() {
    if (get_transient('sdh_ai_assistant_activated')) {
        delete_transient('sdh_ai_assistant_activated');
        ?>
        <div class="notice notice-success is-dismissible">
            <h3><?php _e('SDH AI Assistant Activated!', 'sdh-ai-assistant'); ?></h3>
            <p>
                <?php _e('Thank you for installing SDH AI Assistant!', 'sdh-ai-assistant'); ?>
                <a href="<?php echo admin_url('admin.php?page=sdh-ai-assistant'); ?>">
                    <?php _e('Configure the plugin settings', 'sdh-ai-assistant'); ?>
                </a>
                <?php _e('to get started.', 'sdh-ai-assistant'); ?>
            </p>
            <p>
                <strong><?php _e('Important:', 'sdh-ai-assistant'); ?></strong>
                <?php _e('Make sure your SDH AI Assistant server is running before testing the widget.', 'sdh-ai-assistant'); ?>
            </p>
        </div>
        <?php
    }
}

// Регистрируем обработчики
register_activation_hook(__FILE__, 'sdh_ai_assistant_activate');
register_activation_hook(__FILE__, 'sdh_ai_assistant_check_compatibility');
register_deactivation_hook(__FILE__, 'sdh_ai_assistant_deactivate');

// Обработчик для удаления (вызывается из uninstall.php)
if (defined('WP_UNINSTALL_PLUGIN')) {
    sdh_ai_assistant_uninstall();
}

// Показываем welcome сообщение
add_action('admin_notices', 'sdh_ai_assistant_show_activation_notice');
