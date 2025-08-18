<?php
/**
 * Основной класс плагина SDH AI Assistant
 */

if (!defined('ABSPATH')) {
    exit;
}

class SDH_AI_Assistant_Plugin {
    
    /**
     * Конструктор
     */
    public function __construct() {
        add_action('init', array($this, 'init'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_frontend_scripts'));
        add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_scripts'));
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_init', array($this, 'admin_init'));
        add_action('wp_footer', array($this, 'render_widget'));
        add_shortcode('sdh_ai_widget', array($this, 'widget_shortcode'));
        add_action('wp_ajax_sdh_ai_test_connection', array($this, 'test_api_connection'));
        add_action('wp_ajax_nopriv_sdh_ai_test_connection', array($this, 'test_api_connection'));
        
        // Добавляем ссылки в списке плагинов
        add_filter('plugin_action_links_' . SDH_AI_PLUGIN_BASENAME, array($this, 'add_plugin_links'));
    }
    
    /**
     * Инициализация плагина
     */
    public function init() {
        // Загружаем переводы
        load_plugin_textdomain('sdh-ai-assistant', false, dirname(SDH_AI_PLUGIN_BASENAME) . '/languages');
    }
    
    /**
     * Подключение скриптов и стилей для фронтенда
     */
    public function enqueue_frontend_scripts() {
        // Подключаем только если виджет включен
        if (!get_option('sdh_ai_widget_enabled', false)) {
            return;
        }
        
        // Подключаем CSS
        wp_enqueue_style(
            'sdh-ai-widget',
            SDH_AI_PLUGIN_URL . 'assets/widget.css',
            array(),
            SDH_AI_PLUGIN_VERSION
        );
        
        // Подключаем JS
        wp_enqueue_script(
            'sdh-ai-widget',
            SDH_AI_PLUGIN_URL . 'assets/widget.js',
            array(),
            SDH_AI_PLUGIN_VERSION,
            true
        );
        
        // Передаем настройки в JavaScript
        wp_localize_script('sdh-ai-widget', 'sdhAiSettings', $this->get_widget_settings());
    }
    
    /**
     * Подключение скриптов для админки
     */
    public function enqueue_admin_scripts($hook) {
        // Подключаем только на странице настроек плагина
        if ('settings_page_sdh-ai-assistant' !== $hook) {
            return;
        }
        
        wp_enqueue_style(
            'sdh-ai-admin',
            SDH_AI_PLUGIN_URL . 'assets/admin.css',
            array(),
            SDH_AI_PLUGIN_VERSION
        );
        
        wp_enqueue_script(
            'sdh-ai-admin',
            SDH_AI_PLUGIN_URL . 'assets/admin.js',
            array('jquery'),
            SDH_AI_PLUGIN_VERSION,
            true
        );
        
        wp_localize_script('sdh-ai-admin', 'sdhAiAdmin', array(
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('sdh_ai_admin_nonce'),
            'strings' => array(
                'testing' => __('Тестирование...', 'sdh-ai-assistant'),
                'success' => __('Соединение успешно!', 'sdh-ai-assistant'),
                'error' => __('Ошибка соединения', 'sdh-ai-assistant')
            )
        ));
    }
    
    /**
     * Добавление меню в админку
     */
    public function add_admin_menu() {
        add_options_page(
            __('SDH AI Assistant', 'sdh-ai-assistant'),
            __('AI Assistant', 'sdh-ai-assistant'),
            'manage_options',
            'sdh-ai-assistant',
            array($this, 'admin_page')
        );
    }
    
    /**
     * Регистрация настроек
     */
    public function admin_init() {
        register_setting('sdh_ai_settings_group', 'sdh_ai_widget_enabled');
        register_setting('sdh_ai_settings_group', 'sdh_ai_agent_id');
        register_setting('sdh_ai_settings_group', 'sdh_ai_theme');
        register_setting('sdh_ai_settings_group', 'sdh_ai_position');
        register_setting('sdh_ai_settings_group', 'sdh_ai_title');
        register_setting('sdh_ai_settings_group', 'sdh_ai_placeholder');
        register_setting('sdh_ai_settings_group', 'sdh_ai_primary_color');
        register_setting('sdh_ai_settings_group', 'sdh_ai_api_url');
        register_setting('sdh_ai_settings_group', 'sdh_ai_widget_url');
        register_setting('sdh_ai_settings_group', 'sdh_ai_show_on_mobile');
        register_setting('sdh_ai_settings_group', 'sdh_ai_auto_open');
    }
    
    /**
     * Страница настроек в админке
     */
    public function admin_page() {
        include SDH_AI_PLUGIN_PATH . 'admin/admin-page.php';
    }
    
    /**
     * Рендер виджета в футере
     */
    public function render_widget() {
        if (!get_option('sdh_ai_widget_enabled', false)) {
            return;
        }
        
        // Проверяем мобильные устройства
        if (!get_option('sdh_ai_show_on_mobile', true) && wp_is_mobile()) {
            return;
        }
        
        $settings = $this->get_widget_settings();
        ?>
        <div id="sdh-ai-widget-container" style="display: none;"></div>
        <script>
        // Инициализируем виджет
        document.addEventListener('DOMContentLoaded', function() {
            sdhAiWidget.init();
        });
        </script>
        <?php
    }
    
    /**
     * Шорткод для встраивания виджета
     */
    public function widget_shortcode($atts) {
        $atts = shortcode_atts(array(
            'agent' => get_option('sdh_ai_agent_id', 'devops-specialist'),
            'theme' => get_option('sdh_ai_theme', 'light'),
            'width' => '100%',
            'height' => '500px',
            'title' => get_option('sdh_ai_title', 'AI Assistant')
        ), $atts);
        
        $widget_url = get_option('sdh_ai_widget_url', 'http://localhost:5173');
        $api_url = get_option('sdh_ai_api_url', 'http://localhost:3001');
        
        $iframe_src = $widget_url . '/widget.html?' . http_build_query(array(
            'agentId' => $atts['agent'],
            'theme' => $atts['theme'],
            'position' => 'inline',
            'title' => $atts['title'],
            'apiUrl' => $api_url
        ));
        
        $output = '<div class="sdh-ai-widget-shortcode">';
        $output .= '<iframe src="' . esc_url($iframe_src) . '" ';
        $output .= 'width="' . esc_attr($atts['width']) . '" ';
        $output .= 'height="' . esc_attr($atts['height']) . '" ';
        $output .= 'frameborder="0" ';
        $output .= 'class="sdh-ai-widget-iframe" ';
        $output .= 'allowtransparency="true">';
        $output .= '</iframe>';
        $output .= '</div>';
        
        return $output;
    }
    
    /**
     * Тест соединения с API
     */
    public function test_api_connection() {
        // Проверяем nonce
        if (!wp_verify_nonce($_POST['nonce'], 'sdh_ai_admin_nonce')) {
            wp_die('Security check failed');
        }
        
        $api_url = sanitize_url($_POST['api_url']);
        
        // Тестируем соединение
        $response = wp_remote_get($api_url . '/api/health', array(
            'timeout' => 10,
            'headers' => array(
                'Content-Type' => 'application/json'
            )
        ));
        
        if (is_wp_error($response)) {
            wp_send_json_error(array(
                'message' => $response->get_error_message()
            ));
        }
        
        $status_code = wp_remote_retrieve_response_code($response);
        
        if ($status_code === 200) {
            wp_send_json_success(array(
                'message' => __('Соединение с API успешно установлено!', 'sdh-ai-assistant')
            ));
        } else {
            wp_send_json_error(array(
                'message' => sprintf(__('API вернул код ошибки: %d', 'sdh-ai-assistant'), $status_code)
            ));
        }
    }
    
    /**
     * Получение настроек виджета
     */
    private function get_widget_settings() {
        return array(
            'agentId' => get_option('sdh_ai_agent_id', 'devops-specialist'),
            'theme' => get_option('sdh_ai_theme', 'light'),
            'position' => get_option('sdh_ai_position', 'bottom-right'),
            'title' => get_option('sdh_ai_title', 'AI Assistant'),
            'placeholder' => get_option('sdh_ai_placeholder', 'Введите ваше сообщение...'),
            'primaryColor' => get_option('sdh_ai_primary_color', '#4F7FFF'),
            'apiUrl' => get_option('sdh_ai_api_url', 'http://localhost:3001'),
            'widgetUrl' => get_option('sdh_ai_widget_url', 'http://localhost:5173'),
            'showOnMobile' => get_option('sdh_ai_show_on_mobile', true),
            'autoOpen' => get_option('sdh_ai_auto_open', false)
        );
    }
    
    /**
     * Добавление ссылок в список плагинов
     */
    public function add_plugin_links($links) {
        $settings_link = '<a href="' . admin_url('options-general.php?page=sdh-ai-assistant') . '">' . __('Настройки', 'sdh-ai-assistant') . '</a>';
        array_unshift($links, $settings_link);
        return $links;
    }
}
