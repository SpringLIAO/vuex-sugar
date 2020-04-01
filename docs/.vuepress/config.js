module.exports = {
    title: 'vuex-sugar',
    base: '/vuex-sugar/',
    description:
        ' A Helper utility to simplify the usage of REST APIs with Vuex 2. Uses the popular HTTP client for requests.',
    locales: {
        '/': {
            lang: 'zh-CN',
            title: 'vuex-sugar',
            description:
                '一个帮助简化使用 Vuex 发起 HTTP(REST API)请求的工具。支持 Vuex 2，默认使用流行的 HTTP 客户端axios发起请求。'
        },
        '/en/': {
            lang: 'en-US'
        }
    },
    themeConfig: {
        repo: 'Liaoct/vuex-sugar',
        // 假如文档不是放在仓库的根目录下：
        docsDir: 'docs',
        editLinks: true,
        locales: {
            '/': {
                // 多语言下拉菜单的标题
                selectText: '选择语言',
                // 该语言在下拉菜单中的标签
                label: '简体中文',
                // 编辑链接文字
                editLinkText: '在 GitHub 上编辑此页',
                // Service Worker 的配置
                serviceWorker: {
                    updatePopup: {
                        message: '发现新内容可用.',
                        buttonText: '刷新'
                    }
                },
                // 默认为 "Edit this page"
                editLinkText: '帮助我们改善此页面！',
                // 当前 locale 的 algolia docsearch 选项
                algolia: {},
                sidebar: {
                    '/guide/': ['', 'quick-start', 'tutorial'],
                    '/api/': ['']
                },
                nav: [
                    { text: '首页', link: '/' },
                    { text: '指南', link: '/guide/' },
                    { text: 'API', link: '/api/' },
                    {
                        text: 'Changelog',
                        link: 'https://github.com/Liaoct/vuex-sugar/blob/master/CHANGELOG.md'
                    }
                ]
            },
            '/en/': {
                selectText: 'Languages',
                label: 'English',
                editLinkText: 'Edit this page on GitHub',
                serviceWorker: {
                    updatePopup: {
                        message: 'New content is available.',
                        buttonText: 'Refresh'
                    }
                }
            }
        }
    }
};
