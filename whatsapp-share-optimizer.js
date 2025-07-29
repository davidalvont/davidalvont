/**
 * WhatsApp Share Optimizer - Solução Unificada
 * Otimiza compartilhamento de links para WhatsApp e redes sociais
 * Autor: Claude AI Assistant
 * Versão: 1.0
 */

(function() {
  'use strict';

  // Configurações principais
  const CONFIG = {
    shareImageUrl: 'https://davialvont.com.br/assets/david-avatar.jpeg',
    whatsappImageUrl: 'https://davialvont.com.br/assets/david-avatar.jpeg',
    imageWidth: '1200',
    imageHeight: '630',
    siteName: 'David Alvont',
    defaultTitle: 'David Alvont - Criação de Sites e Google Ads.',
    defaultDescription: 'Marketing e Anúncios. Criação de sites que convertem e campanhas de Google Ads otimizadas.',
    domains: [
      'https://davialvont.com.br',
      'https://www.davialvont.com.br'
    ]
  };

  // Utilitários
  const Utils = {
    isWhatsApp: () => {
      const userAgent = navigator.userAgent || '';
      return userAgent.includes('WhatsApp') || 
             userAgent.includes('FBAN') || 
             userAgent.includes('FBAV');
    },

    isFacebook: () => {
      const userAgent = navigator.userAgent || '';
      return userAgent.includes('facebookexternalhit') ||
             userAgent.includes('Facebot');
    },

    isSocialBot: () => {
      const userAgent = navigator.userAgent || '';
      const socialBots = [
        'WhatsApp', 'facebookexternalhit', 'Facebot', 'Twitterbot',
        'LinkedInBot', 'TelegramBot', 'SkypeUriPreview', 'SlackBot'
      ];
      return socialBots.some(bot => userAgent.includes(bot));
    },

    getCurrentUrl: () => {
      return window.location.href.split('?')[0].split('#')[0];
    },

    hasQueryParam: (param) => {
      return new URLSearchParams(window.location.search).has(param);
    },

    createMetaTag: (property, content, isName = false) => {
      const existing = document.querySelector(`meta[${isName ? 'name' : 'property'}="${property}"]`);
      if (existing) {
        existing.setAttribute('content', content);
        return existing;
      }
      
      const meta = document.createElement('meta');
      meta.setAttribute(isName ? 'name' : 'property', property);
      meta.setAttribute('content', content);
      document.head.appendChild(meta);
      return meta;
    },

    createLinkTag: (rel, href, type = null) => {
      const existing = document.querySelector(`link[rel="${rel}"][href="${href}"]`);
      if (existing) return existing;
      
      const link = document.createElement('link');
      link.setAttribute('rel', rel);
      link.setAttribute('href', href);
      if (type) link.setAttribute('type', type);
      document.head.appendChild(link);
      return link;
    }
  };

  // Gerenciador de Meta Tags
  const MetaManager = {
    setupBasicMetas: () => {
      const currentUrl = Utils.getCurrentUrl();
      const title = document.title || CONFIG.defaultTitle;
      const description = document.querySelector('meta[name="description"]')?.content || CONFIG.defaultDescription;
      
      // Meta tags básicas
      Utils.createMetaTag('description', description, true);
      Utils.createMetaTag('og:type', 'website');
      Utils.createMetaTag('og:site_name', CONFIG.siteName);
      Utils.createMetaTag('og:locale', 'pt_BR');
      
      // Título e descrição
      Utils.createMetaTag('og:title', title);
      Utils.createMetaTag('og:description', description);
      Utils.createMetaTag('og:url', currentUrl);
      
      // Twitter Cards
      Utils.createMetaTag('twitter:card', 'summary_large_image', true);
      Utils.createMetaTag('twitter:title', title, true);
      Utils.createMetaTag('twitter:description', description, true);
    },

    setupImages: (forceWhatsApp = false) => {
      const imageUrl = forceWhatsApp ? CONFIG.whatsappImageUrl : CONFIG.shareImageUrl;
      
      // OpenGraph images
      Utils.createMetaTag('og:image', imageUrl);
      Utils.createMetaTag('og:image:width', CONFIG.imageWidth);
      Utils.createMetaTag('og:image:height', CONFIG.imageHeight);
      Utils.createMetaTag('og:image:alt', CONFIG.siteName);
      Utils.createMetaTag('og:image:type', 'image/jpeg');
      
      // Twitter images
      Utils.createMetaTag('twitter:image', imageUrl, true);
      Utils.createMetaTag('twitter:image:alt', CONFIG.siteName, true);
      
      // WhatsApp específico
      Utils.createMetaTag('whatsapp:image', imageUrl);
      
      // Preload da imagem
      Utils.createLinkTag('preload', imageUrl, 'image/jpeg');
    },

    setupCanonical: () => {
      const currentUrl = Utils.getCurrentUrl();
      const existing = document.querySelector('link[rel="canonical"]');
      
      if (existing) {
        existing.setAttribute('href', currentUrl);
      } else {
        Utils.createLinkTag('canonical', currentUrl);
      }
    },

    setupAlternateLinks: () => {
      const currentUrl = Utils.getCurrentUrl();
      
      CONFIG.domains.forEach(domain => {
        if (!currentUrl.startsWith(domain)) {
          const alternatePath = currentUrl.replace(/https?:\/\/[^\/]+/, domain);
          Utils.createMetaTag('og:see_also', alternatePath);
        }
      });
    }
  };

  // Gerenciador de eventos para compartilhamento
  const ShareManager = {
    init: () => {
      // Intercepta cliques em links para otimizar compartilhamento
      document.addEventListener('click', ShareManager.handleLinkClick, true);
      
      // Intercepta tentativas de compartilhamento via Web Share API
      if (navigator.share) {
        ShareManager.setupWebShareAPI();
      }
    },

    handleLinkClick: (event) => {
      const link = event.target.closest('a[href]');
      if (!link) return;
      
      const href = link.getAttribute('href');
      const isInternal = href.startsWith('/') || 
                        CONFIG.domains.some(domain => href.includes(domain.replace('https://', '')));
      
      if (isInternal) {
        // Adiciona atributos para melhorar o compartilhamento
        link.setAttribute('data-share-optimized', 'true');
        link.setAttribute('data-share-image', CONFIG.shareImageUrl);
        
        // Se detectar que pode ser compartilhado no WhatsApp
        if (Utils.isWhatsApp()) {
          link.setAttribute('data-whatsapp-image', CONFIG.whatsappImageUrl);
        }
      }
    },

    setupWebShareAPI: () => {
      // Intercepta uso da Web Share API para incluir nossa imagem
      const originalShare = navigator.share;
      navigator.share = function(shareData) {
        const enhancedData = {
          ...shareData,
          files: shareData.files || []
        };
        
        return originalShare.call(this, enhancedData);
      };
    }
  };

  // Otimizador específico para WhatsApp
  const WhatsAppOptimizer = {
    init: () => {
      if (Utils.isSocialBot()) {
        WhatsAppOptimizer.optimizeForBots();
      }
      
      if (Utils.isWhatsApp() && !Utils.hasQueryParam('wa_optimized')) {
        WhatsAppOptimizer.optimizeForWhatsApp();
      }
    },

    optimizeForBots: () => {
      console.log('Social media bot detected, optimizing meta tags');
      
      // Força atualização das meta tags para bots
      MetaManager.setupBasicMetas();
      MetaManager.setupImages(true); // Usa imagem otimizada para WhatsApp
      MetaManager.setupCanonical();
      MetaManager.setupAlternateLinks();
      
      // Adiciona informações extras para bots
      Utils.createMetaTag('robots', 'index,follow', true);
      Utils.createMetaTag('og:updated_time', new Date().toISOString());
    },

    optimizeForWhatsApp: () => {
      console.log('WhatsApp access detected, applying optimizations');
      
      // Atualiza meta tags específicas para WhatsApp
      MetaManager.setupImages(true);
      
      // Adiciona parâmetro para evitar re-otimização
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set('wa_optimized', '1');
      
      // Atualiza a URL sem recarregar a página
      history.replaceState(null, '', currentUrl.toString());
      
      // Força atualização da meta tag og:url
      Utils.createMetaTag('og:url', currentUrl.toString());
    }
  };

  // Monitor de mudanças de URL (para SPAs)
  const URLMonitor = {
    init: () => {
      let currentUrl = window.location.href;
      
      // Monitora mudanças via pushState/replaceState
      const originalPushState = history.pushState;
      const originalReplaceState = history.replaceState;
      
      history.pushState = function() {
        originalPushState.apply(history, arguments);
        URLMonitor.handleURLChange();
      };
      
      history.replaceState = function() {
        originalReplaceState.apply(history, arguments);
        URLMonitor.handleURLChange();
      };
      
      // Monitora mudanças via popstate
      window.addEventListener('popstate', URLMonitor.handleURLChange);
      
      // Monitora mudanças via hashchange
      window.addEventListener('hashchange', URLMonitor.handleURLChange);
      
      // Monitor adicional via polling (fallback)
      setInterval(() => {
        if (window.location.href !== currentUrl) {
          currentUrl = window.location.href;
          URLMonitor.handleURLChange();
        }
      }, 1000);
    },

    handleURLChange: () => {
      console.log('URL changed, updating meta tags');
      
      // Aguarda um pouco para o DOM se estabilizar
      setTimeout(() => {
        MetaManager.setupBasicMetas();
        MetaManager.setupImages(Utils.isSocialBot());
        MetaManager.setupCanonical();
      }, 100);
    }
  };

  // Inicialização principal
  const WhatsAppShareOptimizer = {
    init: () => {
      console.log('WhatsApp Share Optimizer initialized');
      
      // Configuração inicial das meta tags
      MetaManager.setupBasicMetas();
      MetaManager.setupImages();
      MetaManager.setupCanonical();
      MetaManager.setupAlternateLinks();
      
      // Inicializa módulos
      WhatsAppOptimizer.init();
      ShareManager.init();
      URLMonitor.init();
      
      // Debug info
      if (window.location.search.includes('debug=true')) {
        WhatsAppShareOptimizer.debugInfo();
      }
    },

    debugInfo: () => {
      console.group('WhatsApp Share Optimizer - Debug Info');
      console.log('User Agent:', navigator.userAgent);
      console.log('Is WhatsApp:', Utils.isWhatsApp());
      console.log('Is Social Bot:', Utils.isSocialBot());
      console.log('Current URL:', Utils.getCurrentUrl());
      console.log('Share Image:', CONFIG.shareImageUrl);
      console.log('WhatsApp Image:', CONFIG.whatsappImageUrl);
      
      // Lista todas as meta tags relevantes
      const metaTags = document.querySelectorAll('meta[property^="og:"], meta[name^="twitter:"], meta[property^="whatsapp:"]');
      console.log('Meta tags:', Array.from(metaTags).map(tag => ({
        property: tag.getAttribute('property') || tag.getAttribute('name'),
        content: tag.getAttribute('content')
      })));
      console.groupEnd();
    }
  };

  // Auto-inicialização quando o DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', WhatsAppShareOptimizer.init);
  } else {
    WhatsAppShareOptimizer.init();
  }

  // Expõe algumas funções úteis globalmente
  window.WhatsAppShareOptimizer = {
    refresh: () => {
      MetaManager.setupBasicMetas();
      MetaManager.setupImages();
      MetaManager.setupCanonical();
    },
    debug: WhatsAppShareOptimizer.debugInfo,
    updateImage: (newImageUrl) => {
      CONFIG.shareImageUrl = newImageUrl;
      MetaManager.setupImages();
    }
  };

})();