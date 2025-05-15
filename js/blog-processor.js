// blog-processor.js
// This script converts Markdown files to HTML and displays them using the site's layout

document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on a blog post page
    const postId = getParameterByName('post');
    if (postId) {
      loadBlogPost(postId);
    } else if (window.location.pathname.includes('blog.html')) {
      // If on the blog index page, load all blog posts
      loadBlogIndex();
    }
  });
  
  // Get URL parameter
  function getParameterByName(name) {
    const url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
    const results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
  }
  
  // Load a specific blog post
  async function loadBlogPost(postId) {
    try {
      const response = await fetch(`/blogs/${postId}.md`);
      if (!response.ok) {
        throw new Error('Post not found');
      }
      
      const markdownContent = await response.text();
      const { title, date, author, thumbnail, content } = parseMarkdown(markdownContent);
      
      // Update page title
      document.title = `${title} - Thaisplicando`;
      
      // Create blog post HTML
      const blogContainer = document.getElementById('blog-content');
      if (blogContainer) {
        blogContainer.innerHTML = `
          <div class="blog-post">
            <div class="blog-header">
              <h1>${title}</h1>
              <div class="post-meta">
                <span class="post-date">${formatDate(date)}</span>
                <span class="post-author">Por ${author}</span>
              </div>
            </div>
            <div class="featured-image">
              <img src="${thumbnail}" alt="${title}">
            </div>
            <div class="post-content">
              ${convertMarkdownToHtml(content)}
            </div>
          </div>
        `;
      }
    } catch (error) {
      console.error('Error loading blog post:', error);
      const blogContainer = document.getElementById('blog-content');
      if (blogContainer) {
        blogContainer.innerHTML = `
          <div class="error-message">
            <h2>Post não encontrado</h2>
            <p>Desculpe, não foi possível encontrar o post solicitado.</p>
            <a href="/blog.html" class="button">Voltar para o Blog</a>
          </div>
        `;
      }
    }
  }
  
  // Load all blog posts for the index page
  async function loadBlogIndex() {
    try {
      // In a real implementation, you would have an index file or API to get all posts
      // For now, we'll use a hardcoded list of posts
      const blogPosts = [
        { id: 'introducao-ia', title: 'Introdução à Inteligência Artificial: O que é e por que é Importante?', date: '2024-03-15', thumbnail: 'images/posts-recentes/post1.jpg' },
        { id: 'engenharia-prompt', title: 'Engenharia de Prompt: A Arte de Guiar Modelos de Linguagem', date: '2024-03-10', thumbnail: 'images/posts-recentes/post2.jpg' },
        { id: 'circuit-breaker', title: 'Circuit Breaker: construindo um software resiliente', date: '2024-03-05', thumbnail: 'images/posts-recentes/post3.jpg' },
        { id: 'poo-harry-potter', title: 'Entendendo Programação Orientada a Objetos com Harry Potter', date: '2024-02-28', thumbnail: 'images/posts-recentes/post4.jpg' },
        { id: 'chica-assistente', title: 'CHICA — A assistente virtual mineira e graciosa', date: '2024-02-20', thumbnail: 'images/posts-recentes/post5.jpg' },
        { id: 'texto-escrita-mao', title: 'Vamos converter um texto em escrita à mão usando Python?', date: '2024-02-15', thumbnail: 'images/posts-recentes/post6.jpg' }
      ];
      
      // Create blog index HTML
      const blogContainer = document.querySelector('.blog-posts-container');
      if (blogContainer) {
        let html = '';
        
        blogPosts.forEach(post => {
          html += `
            <div class="col-md-4 d-flex ftco-animate">
              <div class="blog-entry justify-content-end">
                <div class="text">
                  <h3 class="heading mb-3"><a href="post.html?post=${post.id}">${post.title}</a></h3>
                  <a href="post.html?post=${post.id}" class="block-20 img" style="background-image: url('${post.thumbnail}');">
                  </a>
                  <div class="meta mb-3">
                    <div><a href="#">${formatDate(post.date)}</a></div>
                    <div><a href="#">Admin</a></div>
                    <div><a href="#" class="meta-chat"><span class="fa fa-comment"></span> 3</a></div>
                  </div>
                  <p><a href="post.html?post=${post.id}" class="button">Leia mais</a></p>
                </div>
              </div>
            </div>
          `;
        });
        
        blogContainer.innerHTML = html;
      }
    } catch (error) {
      console.error('Error loading blog index:', error);
    }
  }
  
  // Parse markdown content with front matter
  function parseMarkdown(markdown) {
    // Simple front matter parser
    const frontMatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
    const match = markdown.match(frontMatterRegex);
    
    if (!match) {
      return {
        title: 'Untitled Post',
        date: new Date().toISOString(),
        author: 'Thais Ribeiro',
        thumbnail: 'images/banner/banner-image.jpg',
        content: markdown
      };
    }
    
    const frontMatter = match[1];
    const content = match[2];
    
    // Parse front matter
    const meta = {};
    frontMatter.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split(':');
      if (key && valueParts.length) {
        meta[key.trim()] = valueParts.join(':').trim();
      }
    });
    
    return {
      title: meta.title || 'Untitled Post',
      date: meta.date || new Date().toISOString(),
      author: meta.author || 'Thais Ribeiro',
      thumbnail: meta.thumbnail || 'images/banner/banner-image.jpg',
      content: content
    };
  }
  
  // Convert markdown to HTML (simple implementation)
  function convertMarkdownToHtml(markdown) {
    // This is a very basic implementation
    // In a real project, use a library like marked.js
    
    let html = markdown;
    
    // Convert headers
    html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>');
    html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
    html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');
    html = html.replace(/^#### (.*$)/gm, '<h4>$1</h4>');
    
    // Convert bold and italic
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Convert links
    html = html.replace(/\[([^\[]+)\]\(([^\)]+)\)/g, '<a href="$2">$1</a>');
    
    // Convert paragraphs
    html = html.replace(/^\s*(\n)?(.+)/gm, function(m) {
      return /\<(\/)?(h1|h2|h3|h4|ul|ol|li|blockquote|pre|img|a)/.test(m) ? m : '<p>' + m + '</p>';
    });
    
    // Convert line breaks
    html = html.replace(/\n/g, '<br>');
    
    return html;
  }
  
  // Format date for display
  function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('pt-BR', options);
  }