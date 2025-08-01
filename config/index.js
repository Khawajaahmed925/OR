const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const config = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    assistantId: process.env.ASSISTANT_ID
  },
  webhook: {
    url: process.env.WEBHOOK_URL,
    secret: process.env.WEBHOOK_SECRET
  },
  server: {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development'
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
  },
  // AI Employee configurations with PRODUCTION webhook URLs
  employees: {
    brenden: {
      assistantId: 'asst_MvlMZ3IOvQrTkbsENRSzGRwZ',
      name: 'AI Brenden',
      role: 'lead scraper',
      specialty: 'Lead Research Specialist',
      webhookUrl: 'https://pccommandcenter.app.n8n.cloud/webhook/9acfb29c-d648-4f5f-afd2-08cb30122877'
    },
    van: {
      assistantId: 'asst_x0WhKHr61IUopNPR7A8No9kK',
      name: 'AI Van',
      role: 'page operator',
      specialty: 'Digital Marketing Designer',
      webhookUrl: 'https://pccommandcenter.app.n8n.cloud/webhook/71791fd2-82db-423e-8a8a-47e90fbd16b9'
    },
    angel: {
      assistantId: 'asst_angel_placeholder',
      name: 'AI Angel',
      role: 'voice caller',
      specialty: 'Voice Outreach Manager',
      webhookUrl: 'https://hook.eu2.make.com/angel_webhook_placeholder' // Add real webhook when ready
    }
    // EASILY ADD MORE EMPLOYEES HERE:
    // sarah: {
    //   assistantId: 'asst_sarah_id',
    //   name: 'AI Sarah',
    //   role: 'content creator',
    //   specialty: 'Content Marketing Specialist',
    //   webhookUrl: 'https://hook.eu2.make.com/sarah_webhook_url'
    // }
  }
};

// Validate required configuration
const requiredConfig = [
  { key: 'openai.apiKey', value: config.openai.apiKey, name: 'OPENAI_API_KEY' }
];

const missingConfig = requiredConfig.filter(item => 
  !item.value || 
  item.value.includes('your_') || 
  item.value === 'your_openai_api_key_here'
);

if (missingConfig.length > 0) {
  if (config.server.nodeEnv === 'development') {
    console.warn('⚠️  Running in demo mode - some features will be limited:');
    missingConfig.forEach(item => {
      console.warn(`   - ${item.name} not configured properly`);
    });
    console.warn('\n   To enable full functionality, please configure your .env file with real values.');
    console.warn('   The server will start but API calls will fail until properly configured.\n');
  } else {
    console.error('Missing or invalid required environment variables:');
    missingConfig.forEach(item => {
      console.error(`- ${item.name}`);
    });
    console.error('\nPlease check your .env file or environment variables.');
    process.exit(1);
  }
}

// Additional validation for API key format
if (config.openai.apiKey && !config.openai.apiKey.startsWith('sk-')) {
  console.error('Invalid OpenAI API key format. API keys should start with "sk-"');
  if (config.server.nodeEnv !== 'development') {
    process.exit(1);
  }
}

// Validate employee webhook URLs
console.log('\n🔗 Employee Webhook Configuration:');
Object.entries(config.employees).forEach(([key, employee]) => {
  const isConfigured = employee.webhookUrl && !employee.webhookUrl.includes('placeholder');
  const status = isConfigured ? '✅' : '⚠️';
  const urlType = employee.webhookUrl.includes('webhook-test') ? '(TEST)' : '(PRODUCTION)';
  console.log(`   ${status} ${employee.name}: ${employee.webhookUrl} ${isConfigured ? urlType : ''}`);
});

module.exports = config;
