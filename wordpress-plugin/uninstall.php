<?php
/**
 * Файл удаления плагина
 * Вызывается при полном удалении плагина через админку WordPress
 *
 * @package SdhAiAssistant
 */

// Проверяем, что скрипт вызван WordPress при удалении плагина
if (!defined('WP_UNINSTALL_PLUGIN')) {
    exit;
}

/**
 * Полное удаление всех данных плагина
 */
function sdh_ai_assistant_complete_uninstall() {
    // Удаляем все опции плагина
    $options_to_delete = array(
        'sdh_ai_api_url',
        'sdh_ai_default_agent',
        'sdh_ai_theme',
        'sdh_ai_width',
        'sdh_ai_height',
        'sdh_ai_position',
        'sdh_ai_enabled'
    );
    
    foreach ($options_to_delete as $option) {
        delete_option($option);
        
        // Также удаляем из мультисайт сетей
        delete_site_option($option);
    }
    
    // Удаляем все временные данные (transients)
    $transients_to_delete = array(
        'sdh_ai_assistant_activated',
        'sdh_ai_assistant_api_test_result',
        'sdh_ai_assistant_agents_cache',
        'sdh_ai_assistant_connection_status'
    );
    
    foreach ($transients_to_delete as $transient) {
        delete_transient($transient);
        delete_site_transient($transient);
    }
    
    // Удаляем пользовательские meta данные
    delete_metadata('user', 0, 'sdh_ai_assistant_preferences', '', true);
    
    // Удаляем capabilities
    $roles = array('administrator', 'editor');
    foreach ($roles as $role_name) {
        $role = get_role($role_name);
        if ($role) {
            $role->remove_cap('manage_sdh_ai_assistant');
        }
    }
    
    // Очищаем кеш объектов
    if (function_exists('wp_cache_flush')) {
        wp_cache_flush();
    }
    
    // Очищаем кеш опций
    wp_cache_delete('alloptions', 'options');
    
    // Логируем удаление
    if (function_exists('error_log')) {
        error_log('SDH AI Assistant: Plugin completely uninstalled and all data removed');
    }
}

/**
 * Удаление для мультисайт сетей
 */
function sdh_ai_assistant_uninstall_multisite() {
    if (is_multisite()) {
        $sites = get_sites();
        foreach ($sites as $site) {
            switch_to_blog($site->blog_id);
            sdh_ai_assistant_complete_uninstall();
            restore_current_blog();
        }
    } else {
        sdh_ai_assistant_complete_uninstall();
    }
}

// Выполняем удаление
sdh_ai_assistant_uninstall_multisite();
