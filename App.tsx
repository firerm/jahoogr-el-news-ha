import React, { useState, useCallback } from 'react';
import { 
  BookOpen, 
  Code, 
  Settings, 
  Rss, 
  Search,
  Check,
  Copy,
  Info,
  Globe,
  Github,
  DownloadCloud
} from 'lucide-react';
import { findRssFeed } from './services/gemini';
import { generateFiles } from './utils/haTemplates';
import { GeneratedFile, IntegrationConfig } from './types';
import { translations, Language } from './utils/translations';

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('manifest.json');
  const [copied, setCopied] = useState(false);
  const [lang, setLang] = useState<Language>('el'); // Default to Greek
  
  const [config, setConfig] = useState<IntegrationConfig>({
    name: 'Jahoo EL news HA',
    domain: 'jahoo_el_news_ha',
    rssUrl: '',
    scanInterval: 15
  });

  const [githubInfo, setGithubInfo] = useState({
    user: '',
    repo: ''
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [generatedFiles, setGeneratedFiles] = useState<GeneratedFile[]>([]);

  // Generate files whenever config or language changes
  React.useEffect(() => {
    const gh = githubInfo.user && githubInfo.repo ? githubInfo : undefined;
    if (config.name && config.domain && config.rssUrl) {
      setGeneratedFiles(generateFiles(config, lang, gh));
    }
  }, [config, lang, githubInfo]);

  const handleSmartSearch = useCallback(async () => {
    if (!searchQuery) return;
    setLoading(true);
    const result = await findRssFeed(searchQuery);
    setLoading(false);
    
    if (result) {
      const sanitizedDomain = result.name.toLowerCase().replace(/[^a-z0-9_]/g, '_');
      setConfig(prev => ({
        ...prev,
        rssUrl: result.url,
        name: result.name,
        domain: sanitizedDomain
      }));
    } else {
      alert(lang === 'el' 
        ? "Δεν βρέθηκε RSS feed. Παρακαλώ εισάγετε το URL χειροκίνητα." 
        : "Could not find an RSS feed. Please enter URL manually.");
    }
  }, [searchQuery, lang]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleLanguage = () => {
    setLang(prev => prev === 'en' ? 'el' : 'en');
  };

  const activeFileContent = generatedFiles.find(f => f.filename === activeTab);
  const t = translations[lang];

  const getHacsUrl = () => {
    if (!githubInfo.user || !githubInfo.repo) return null;
    return `https://my.home-assistant.io/redirect/hacs_repository/?owner=${githubInfo.user}&repository=${githubInfo.repo}&category=integration`;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-blue-600 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Rss className="h-8 w-8" />
            <div>
              <h1 className="text-xl font-bold">{t.title}</h1>
              <p className="text-blue-100 text-xs">{t.subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleLanguage}
              className="flex items-center gap-1 bg-blue-700 hover:bg-blue-800 transition-colors px-3 py-1 rounded-full text-sm font-medium border border-blue-500"
            >
              <Globe className="w-4 h-4" />
              {lang === 'en' ? 'EN' : 'EL'}
            </button>
            <div className="text-sm bg-blue-700 px-3 py-1 rounded-full border border-blue-500 hidden sm:block">
              {t.hacsCompatible}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Configuration */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* AI Assist Section */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-4 text-gray-800">
              <Search className="w-5 h-5 text-blue-500" />
              {t.quickStart}
            </h2>
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                {t.searchLabel}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  className="flex-1 rounded-lg border-gray-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  onKeyDown={(e) => e.key === 'Enter' && handleSmartSearch()}
                />
                <button
                  onClick={handleSmartSearch}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {loading ? t.searching : t.searchButton}
                </button>
              </div>
              <p className="text-xs text-gray-500">
                {t.aiDisclaimer}
              </p>
            </div>
          </div>

          {/* Manual Configuration */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-4 text-gray-800">
              <Settings className="w-5 h-5 text-blue-500" />
              {t.configuration}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.integrationName}
                </label>
                <input
                  type="text"
                  value={config.name}
                  onChange={(e) => setConfig({...config, name: e.target.value})}
                  className="w-full rounded-lg border-gray-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.domain}
                </label>
                <input
                  type="text"
                  value={config.domain}
                  onChange={(e) => setConfig({...config, domain: e.target.value.toLowerCase().replace(/\s/g, '_')})}
                  className="w-full rounded-lg border-gray-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.rssUrl}
                </label>
                <input
                  type="text"
                  value={config.rssUrl}
                  onChange={(e) => setConfig({...config, rssUrl: e.target.value})}
                  className="w-full rounded-lg border-gray-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-mono text-xs"
                  placeholder="https://site.com/rss.xml"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.scanInterval}
                </label>
                <input
                  type="number"
                  value={config.scanInterval}
                  onChange={(e) => setConfig({...config, scanInterval: parseInt(e.target.value) || 15})}
                  className="w-full rounded-lg border-gray-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* HACS Distribution Section */}
          <div className="bg-gray-800 text-white p-6 rounded-xl shadow-lg border border-gray-700">
             <h2 className="text-lg font-semibold flex items-center gap-2 mb-4 text-white">
              <Github className="w-5 h-5" />
              {t.hacsSection.title}
            </h2>
            <p className="text-gray-300 text-xs mb-4">{t.hacsSection.description}</p>
            
            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">{t.hacsSection.githubUser}</label>
                <input 
                  type="text" 
                  placeholder="e.g. TassosManolis"
                  className="w-full rounded bg-gray-700 border-gray-600 border px-2 py-1 text-sm text-white focus:ring-1 focus:ring-blue-400 outline-none"
                  value={githubInfo.user}
                  onChange={(e) => setGithubInfo({...githubInfo, user: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">{t.hacsSection.githubRepo}</label>
                <input 
                  type="text" 
                  placeholder="e.g. jahoo-el-news-ha"
                  className="w-full rounded bg-gray-700 border-gray-600 border px-2 py-1 text-sm text-white focus:ring-1 focus:ring-blue-400 outline-none"
                  value={githubInfo.repo}
                  onChange={(e) => setGithubInfo({...githubInfo, repo: e.target.value})}
                />
              </div>
            </div>

            {getHacsUrl() ? (
              <div className="space-y-2">
                <div className="text-xs text-green-400 font-semibold uppercase tracking-wider">{t.hacsSection.buttonPreview}</div>
                <a 
                  href={getHacsUrl()!}
                  target="_blank"
                  rel="noreferrer"
                  className="block w-full text-center bg-[#41bdf5] hover:bg-[#30aadd] text-white font-bold py-2 px-4 rounded shadow-md transition-transform active:scale-95 flex items-center justify-center gap-2"
                >
                  <img src="https://my.home-assistant.io/badges/hacs_repository.svg" alt="Open your Home Assistant instance and open a repository inside the Home Assistant Community Store." className="h-8" />
                </a>
                <div className="text-[10px] text-gray-400 text-center">
                  Redirects to local Home Assistant via MyHomeAssistant
                </div>
              </div>
            ) : (
              <div className="text-xs text-gray-500 italic text-center border border-gray-700 rounded p-2">
                {t.hacsSection.generateButton}
              </div>
            )}
            
            <div className="mt-6 border-t border-gray-700 pt-4">
               <h3 className="text-sm font-bold text-gray-200 mb-2 flex items-center gap-2">
                 <DownloadCloud className="w-4 h-4" /> {t.hacsSection.howToUpload}
               </h3>
               <ol className="list-decimal list-inside space-y-2 text-xs text-gray-300">
                  <li>{t.hacsSection.step1}</li>
                  <li>
                    {t.hacsSection.step2} <code className="bg-gray-900 px-1 py-0.5 rounded text-green-400">custom_components/{config.domain}/</code>
                  </li>
                  <li>{t.hacsSection.step3}</li>
                  <li>{t.hacsSection.step4}</li>
               </ol>
            </div>
          </div>

        </div>

        {/* Right Column: Code Output */}
        <div className="lg:col-span-8 flex flex-col h-[800px] bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {/* File Tabs */}
          <div className="flex bg-gray-100 border-b border-gray-200 overflow-x-auto">
            {generatedFiles.map((file) => (
              <button
                key={file.filename}
                onClick={() => setActiveTab(file.filename)}
                className={`px-4 py-3 text-sm font-medium border-r border-gray-200 whitespace-nowrap transition-colors flex items-center gap-2 ${
                  activeTab === file.filename 
                    ? 'bg-white text-blue-600 border-b-2 border-b-blue-600' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {file.language === 'python' ? <Code className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
                {file.filename}
              </button>
            ))}
          </div>

          {/* Description Bar */}
          <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex justify-between items-center">
            <span className="text-xs text-gray-500 font-medium">
              {activeFileContent?.description}
            </span>
            <button
              onClick={() => activeFileContent && copyToClipboard(activeFileContent.content)}
              className="flex items-center gap-1 text-xs font-medium text-gray-600 hover:text-blue-600 transition-colors"
            >
              {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
              {copied ? t.copied : t.copyCode}
            </button>
          </div>

          {/* Code Editor Area */}
          <div className="flex-1 overflow-auto bg-[#1e1e1e] p-4">
            <pre className="font-mono text-sm leading-relaxed text-gray-300">
              <code>{activeFileContent?.content}</code>
            </pre>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;