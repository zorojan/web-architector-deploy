<?php
if (!defined('ABSPATH')) {
    exit;
}

// Обработка сохранения настроек
if (isset($_POST['submit']) && wp_verify_nonce($_POST['sdh_ai_nonce'], 'sdh_ai_settings')) {
    update_option('sdh_ai_widget_enabled', isset($_POST['sdh_ai_widget_enabled']));
    update_option('sdh_ai_agent_id', sanitize_text_field($_POST['sdh_ai_agent_id']));
    update_option('sdh_ai_theme', sanitize_text_field($_POST['sdh_ai_theme']));
    update_option('sdh_ai_position', sanitize_text_field($_POST['sdh_ai_position']));
    update_option('sdh_ai_title', sanitize_text_field($_POST['sdh_ai_title']));
    update_option('sdh_ai_placeholder', sanitize_text_field($_POST['sdh_ai_placeholder']));
    update_option('sdh_ai_primary_color', sanitize_hex_color($_POST['sdh_ai_primary_color']));
    update_option('sdh_ai_api_url', esc_url_raw($_POST['sdh_ai_api_url']));
    update_option('sdh_ai_widget_url', esc_url_raw($_POST['sdh_ai_widget_url']));
    update_option('sdh_ai_show_on_mobile', isset($_POST['sdh_ai_show_on_mobile']));
    update_option('sdh_ai_auto_open', isset($_POST['sdh_ai_auto_open']));
    
    echo '<div class="notice notice-success is-dismissible"><p>' . __('Настройки сохранены!', 'sdh-ai-assistant') . '</p></div>';
}

// Получаем текущие настройки
$enabled = get_option('sdh_ai_widget_enabled', false);
$agent_id = get_option('sdh_ai_agent_id', 'devops-specialist');
$theme = get_option('sdh_ai_theme', 'light');
$position = get_option('sdh_ai_position', 'bottom-right');
$title = get_option('sdh_ai_title', 'AI Assistant');
$placeholder = get_option('sdh_ai_placeholder', 'Введите ваше сообщение...');
$primary_color = get_option('sdh_ai_primary_color', '#4F7FFF');
$api_url = get_option('sdh_ai_api_url', 'http://localhost:3001');
$widget_url = get_option('sdh_ai_widget_url', 'http://localhost:5173');
$show_on_mobile = get_option('sdh_ai_show_on_mobile', true);
$auto_open = get_option('sdh_ai_auto_open', false);

// Получаем список агентов из API
$agents = array();
$api_status = false;

try {
    $response = wp_remote_get($api_url . '/api/agents', array(
        'timeout' => 5,
        'headers' => array('Content-Type' => 'application/json')
    ));
    
    if (!is_wp_error($response) && wp_remote_retrieve_response_code($response) === 200) {
        $body = wp_remote_retrieve_body($response);
        $agents_data = json_decode($body, true);
        if (is_array($agents_data)) {
            $agents = $agents_data;
            $api_status = true;
        }
    }
} catch (Exception $e) {
    // Ignore
}

// Агенты по умолчанию если API недоступно
if (empty($agents)) {
    $agents = array(
        array('id' => 'devops-specialist', 'name' => 'DevOps Specialist'),
        array('id' => 'ai-advisor-1', 'name' => 'AI Advisor'),
        array('id' => 'startup-consultant', 'name' => 'Startup Consultant'),
        array('id' => 'technical-architect', 'name' => 'Technical Architect')
    );
}
?>

<div class="wrap">
    <h1><?php echo esc_html(get_admin_page_title()); ?></h1>
    
    <div class="sdh-ai-admin-header">
        <div class="sdh-ai-status <?php echo $api_status ? 'connected' : 'disconnected'; ?>">
            <span class="status-indicator"></span>
            <span class="status-text">
                <?php if ($api_status): ?>
                    <?php _e('API подключен', 'sdh-ai-assistant'); ?>
                <?php else: ?>
                    <?php _e('API недоступен', 'sdh-ai-assistant'); ?>
                <?php endif; ?>
            </span>
        </div>
    </div>
    
    <nav class="nav-tab-wrapper">
        <a href="#general" class="nav-tab nav-tab-active"><?php _e('Основные настройки', 'sdh-ai-assistant'); ?></a>
        <a href="#appearance" class="nav-tab"><?php _e('Внешний вид', 'sdh-ai-assistant'); ?></a>
        <a href="#advanced" class="nav-tab"><?php _e('Дополнительно', 'sdh-ai-assistant'); ?></a>
        <a href="#help" class="nav-tab"><?php _e('Помощь', 'sdh-ai-assistant'); ?></a>
    </nav>
    
    <form method="post" action="" class="sdh-ai-admin-form">
        <?php wp_nonce_field('sdh_ai_settings', 'sdh_ai_nonce'); ?>
        
        <!-- Основные настройки -->
        <div id="general" class="tab-content active">
            <table class="form-table">
                <tr>
                    <th scope="row"><?php _e('Включить виджет', 'sdh-ai-assistant'); ?></th>
                    <td>
                        <label>
                            <input type="checkbox" name="sdh_ai_widget_enabled" value="1" <?php checked($enabled); ?>>
                            <?php _e('Показывать виджет на сайте', 'sdh-ai-assistant'); ?>
                        </label>
                        <p class="description"><?php _e('Включает автоматическое отображение виджета на всех страницах сайта', 'sdh-ai-assistant'); ?></p>
                    </td>
                </tr>
                
                <tr>
                    <th scope="row"><?php _e('AI Агент', 'sdh-ai-assistant'); ?></th>
                    <td>
                        <select name="sdh_ai_agent_id" class="regular-text">
                            <?php foreach ($agents as $agent): ?>
                                <option value="<?php echo esc_attr($agent['id']); ?>" <?php selected($agent_id, $agent['id']); ?>>
                                    <?php echo esc_html($agent['name'] ?? $agent['id']); ?>
                                </option>
                            <?php endforeach; ?>
                        </select>
                        <p class="description"><?php _e('Выберите AI агента, который будет отвечать пользователям', 'sdh-ai-assistant'); ?></p>
                    </td>
                </tr>
                
                <tr>
                    <th scope="row"><?php _e('API URL', 'sdh-ai-assistant'); ?></th>
                    <td>
                        <input type="url" name="sdh_ai_api_url" value="<?php echo esc_attr($api_url); ?>" class="regular-text">
                        <button type="button" id="test-api-connection" class="button"><?php _e('Тест соединения', 'sdh-ai-assistant'); ?></button>
                        <p class="description"><?php _e('URL вашего SDH AI Assistant API сервера', 'sdh-ai-assistant'); ?></p>
                        <div id="api-test-result"></div>
                    </td>
                </tr>
                
                <tr>
                    <th scope="row"><?php _e('Widget URL', 'sdh-ai-assistant'); ?></th>
                    <td>
                        <input type="url" name="sdh_ai_widget_url" value="<?php echo esc_attr($widget_url); ?>" class="regular-text">
                        <p class="description"><?php _e('URL вашего SDH AI Assistant фронтенда', 'sdh-ai-assistant'); ?></p>
                    </td>
                </tr>
            </table>
        </div>
        
        <!-- Внешний вид -->
        <div id="appearance" class="tab-content">
            <table class="form-table">
                <tr>
                    <th scope="row"><?php _e('Тема', 'sdh-ai-assistant'); ?></th>
                    <td>
                        <select name="sdh_ai_theme">
                            <option value="light" <?php selected($theme, 'light'); ?>><?php _e('Светлая', 'sdh-ai-assistant'); ?></option>
                            <option value="dark" <?php selected($theme, 'dark'); ?>><?php _e('Темная', 'sdh-ai-assistant'); ?></option>
                        </select>
                    </td>
                </tr>
                
                <tr>
                    <th scope="row"><?php _e('Позиция виджета', 'sdh-ai-assistant'); ?></th>
                    <td>
                        <select name="sdh_ai_position">
                            <option value="bottom-right" <?php selected($position, 'bottom-right'); ?>><?php _e('Снизу справа', 'sdh-ai-assistant'); ?></option>
                            <option value="bottom-left" <?php selected($position, 'bottom-left'); ?>><?php _e('Снизу слева', 'sdh-ai-assistant'); ?></option>
                        </select>
                    </td>
                </tr>
                
                <tr>
                    <th scope="row"><?php _e('Заголовок', 'sdh-ai-assistant'); ?></th>
                    <td>
                        <input type="text" name="sdh_ai_title" value="<?php echo esc_attr($title); ?>" class="regular-text">
                        <p class="description"><?php _e('Заголовок, который отображается в виджете', 'sdh-ai-assistant'); ?></p>
                    </td>
                </tr>
                
                <tr>
                    <th scope="row"><?php _e('Placeholder', 'sdh-ai-assistant'); ?></th>
                    <td>
                        <input type="text" name="sdh_ai_placeholder" value="<?php echo esc_attr($placeholder); ?>" class="regular-text">
                        <p class="description"><?php _e('Текст-подсказка в поле ввода сообщения', 'sdh-ai-assistant'); ?></p>
                    </td>
                </tr>
                
                <tr>
                    <th scope="row"><?php _e('Основной цвет', 'sdh-ai-assistant'); ?></th>
                    <td>
                        <input type="color" name="sdh_ai_primary_color" value="<?php echo esc_attr($primary_color); ?>">
                        <p class="description"><?php _e('Основной цвет виджета', 'sdh-ai-assistant'); ?></p>
                    </td>
                </tr>
            </table>
        </div>
        
        <!-- Дополнительные настройки -->
        <div id="advanced" class="tab-content">
            <table class="form-table">
                <tr>
                    <th scope="row"><?php _e('Мобильные устройства', 'sdh-ai-assistant'); ?></th>
                    <td>
                        <label>
                            <input type="checkbox" name="sdh_ai_show_on_mobile" value="1" <?php checked($show_on_mobile); ?>>
                            <?php _e('Показывать виджет на мобильных устройствах', 'sdh-ai-assistant'); ?>
                        </label>
                    </td>
                </tr>
                
                <tr>
                    <th scope="row"><?php _e('Автоматическое открытие', 'sdh-ai-assistant'); ?></th>
                    <td>
                        <label>
                            <input type="checkbox" name="sdh_ai_auto_open" value="1" <?php checked($auto_open); ?>>
                            <?php _e('Автоматически открывать виджет при загрузке страницы', 'sdh-ai-assistant'); ?>
                        </label>
                    </td>
                </tr>
            </table>
        </div>
        
        <!-- Помощь -->
        <div id="help" class="tab-content">
            <div class="sdh-ai-help-section">
                <h3><?php _e('Как использовать плагин', 'sdh-ai-assistant'); ?></h3>
                
                <div class="help-item">
                    <h4><?php _e('1. Автоматический виджет', 'sdh-ai-assistant'); ?></h4>
                    <p><?php _e('Включите опцию "Показывать виджет на сайте" на вкладке "Основные настройки", и виджет автоматически появится на всех страницах сайта.', 'sdh-ai-assistant'); ?></p>
                </div>
                
                <div class="help-item">
                    <h4><?php _e('2. Использование шорткода', 'sdh-ai-assistant'); ?></h4>
                    <p><?php _e('Используйте шорткод для встраивания чата в конкретное место на странице или в записи:', 'sdh-ai-assistant'); ?></p>
                    <code>[sdh_ai_widget]</code>
                    
                    <p><?php _e('Шорткод с параметрами:', 'sdh-ai-assistant'); ?></p>
                    <code>[sdh_ai_widget agent="devops-specialist" theme="dark" width="400px" height="600px"]</code>
                </div>
                
                <div class="help-item">
                    <h4><?php _e('3. PHP код для шаблонов', 'sdh-ai-assistant'); ?></h4>
                    <p><?php _e('Для встраивания в файлы шаблонов WordPress:', 'sdh-ai-assistant'); ?></p>
                    <code>&lt;?php echo do_shortcode('[sdh_ai_widget]'); ?&gt;</code>
                </div>
                
                <div class="help-item">
                    <h4><?php _e('4. Доступные агенты', 'sdh-ai-assistant'); ?></h4>
                    <ul>
                        <?php foreach ($agents as $agent): ?>
                            <li><strong><?php echo esc_html($agent['name'] ?? $agent['id']); ?></strong> - <code><?php echo esc_html($agent['id']); ?></code></li>
                        <?php endforeach; ?>
                    </ul>
                </div>
            </div>
        </div>
        
        <?php submit_button(__('Сохранить настройки', 'sdh-ai-assistant')); ?>
    </form>
    
    <?php if ($enabled): ?>
    <div class="sdh-ai-preview-section">
        <h2><?php _e('Предварительный просмотр', 'sdh-ai-assistant'); ?></h2>
        <div class="sdh-ai-preview-container">
            <?php 
            $preview_url = $widget_url . '/widget.html?' . http_build_query(array(
                'agentId' => $agent_id,
                'theme' => $theme,
                'position' => 'inline',
                'title' => $title,
                'placeholder' => $placeholder,
                'primaryColor' => $primary_color,
                'apiUrl' => $api_url
            ));
            ?>
            <iframe src="<?php echo esc_url($preview_url); ?>" 
                    width="100%" 
                    height="500px" 
                    frameborder="0" 
                    class="sdh-ai-preview-iframe">
            </iframe>
        </div>
    </div>
    <?php endif; ?>
</div>
