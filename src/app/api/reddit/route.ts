import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const layer = searchParams.get('layer') || 'direct';

  const subredditsMap: Record<string, string[]> = {
    direct: [
      'forhire', 'freelance_forhire', 'developerjobs', 'devjobs', 'jobbit', 
      'hiring', 'WebDevJobs', 'WebDeveloperJobs', 'wordpressjobs', 'Shopifyjobs', 
      'WebflowJobs', 'devopsjobs', 'sysadminjobs', 'b2bforhire', 'devsforhire'
    ],
    intent: [
      'startups', 'SaaS', 'Entrepreneur', 'smallbusiness', 'indiehackers', 
      'microsaas', 'startupideas', 'SideProject', 'ecommerce', 'shopify', 'dropship'
    ],
    tech: [
      'ArtificialIntelligence', 'MachineLearning', 'OpenAI', 'LocalLLaMA', 'AIdev', 
      'learnmachinelearning', 'ai', 'ml', 'automation', 'crm', 'datascience', 
      'dataengineering', 'analytics', 'cybersecurity', 'devops', 'backend', 'frontend', 'webdev'
    ],
    india: [
      'developersIndia', 'StartUpIndia', 'IndianStartups', 'IndiaJobsOpenings', 'IndiaJobs', 'IndiaCareers'
    ]
  };

  const selectedSubs = subredditsMap[layer] || subredditsMap.direct;
  const subredditsString = selectedSubs.join('+');

  try {
    const res = await fetch(`https://www.reddit.com/r/${subredditsString}/new.json?limit=50`, {
      headers: {
        'User-Agent': 'DazecoLeadScraper/1.0 (Contact: dazeco-admin)',
      },
      next: { revalidate: 60 } // Cache for 60 seconds
    });

    if (!res.ok) {
      throw new Error(`Reddit API returned ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
