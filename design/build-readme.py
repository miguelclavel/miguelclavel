# Writes ../README.md for the profile from the rendered blocks in assets/profile.
# Usage, from this folder: python3 build-readme.py
U = '?utm_source=github&utm_medium=profile'
A = 'assets/profile/'

# Animated blocks are SVG (render-motion.mjs); only the two buttons stay WebP (render.mjs).
MOTION = {'hero', 'stats', 'h-work', 'h-built', 'h-ai', 'h-copy', 'h-exp', 'how', 'exp', 'tools',
          'built-chat', 'built-site', *('work-%d' % i for i in range(1, 7)), *('kit-%d' % i for i in range(1, 7))}


def pic(name, alt, width=None, height=None):
    size = f' width="{width}"' if width else (f' height="{height}"' if height else '')
    ext = 'svg' if name in MOTION else 'webp'
    return (f'<picture><source media="(prefers-color-scheme: dark)" srcset="{A}{name}-dark.{ext}">'
            f'<img src="{A}{name}-light.{ext}"{size} alt="{alt}"></picture>')

def link(url, inner):
    return f'<a href="{url}">{inner}</a>'

work = [
    ('work-1', 'auto-insurance-conversational-flow', 'Conversational Insurance Flow. U.S. News. 23 form fields became 19 questions you answer with a tap. Read the case study.'),
    ('work-2', 'insurance-landing-page', 'Insurance Landing Page. U.S. News. A quote form first, and the site audit score went from 66 to 88. Read the case study.'),
    ('work-3', '360-homepage-redesign', '360 Homepage Redesign. U.S. News 360 Reviews. Heatmaps turned a content directory into product discovery. Read the case study.'),
    ('work-4', 'comparison-system', 'Comparison System. U.S. News. One comparison pattern, from a wide desktop table to a phone. Read the case study.'),
    ('work-5', 'us-news-brand-guide', 'U.S. News Brand Guide. A brand nobody owned, turned into a 54 page system. Read the case study.'),
    ('work-6', 'miami-heat-homepage', 'Miami HEAT Homepage. HEAT.com relaunched, editorial and commerce on every gameday. Read the case study.'),
]
more = [
    ('mindset-landing-page-strategy', 'Mindset Landing Page Strategy', 'three testable landing page directions and an experiment plan'),
    ('monthly-testing-review', 'Monthly Testing Review', 'experiment operations that turned isolated A/B tests into shared learning'),
    ('arena-rebrand-cms', 'Arena Rebrand and CMS Migration', 'a live arena site kept accurate through a full rebrand and CMS migration'),
    ('blu-products-launch-system', 'BLU Products Launch System', 'more than 20 phone launches, every channel running off one set of parts'),
    ('601-miami-website', '601 Miami Website', 'hospitality UX for a restaurant and private events venue'),
    ('medical-training-membership-journey', 'Medical Training Membership Journey', 'a training catalog turned into a clear membership decision'),
]
kits = [
    ('kit-1', 'ai-ux-patterns', 'AI UX patterns: seven patterns for AI people can trust, each with a live demo.'),
    ('kit-2', 'claude-skills-for-designers', 'Claude skills for designers: ten Claude Code skills from my own process.'),
    ('kit-3', 'ux-research-skills', 'UX research skills: eighteen skills, one per research job.'),
    ('kit-4', 'ai-prompts-for-designers', 'AI prompts for designers: ten prompts, each with the checks to run.'),
    ('kit-5', 'product-design-playbook', 'Product design playbook: eight steps from a vague request to live, with free templates.'),
    ('kit-6', 'portfolio-chat-starter', 'Portfolio chat starter: a portfolio people can talk to, in one file.'),
]
demos = ['name-hover', 'pixel-trail', 'wave-line', 'scroll-into-header', 'pixel-dissolve', 'dark-mode', 'sticker-burst', 'curve-carousel', 'portfolio-details', 'pixel-run-game']

L = []
L.append(pic('hero', 'Miguel Clavel. Complex products, made simple. Senior Product Designer at U.S. News &amp; World Report. I design fintech, insurance and credit products used by more than 40 million people a year.', width='100%'))
L.append('')
L.append('<p align="center">' + link('https://miguelclavel.com/' + U, pic('btn-portfolio', 'View my portfolio', height=58))
         + link('https://chat.miguelclavel.com/' + U, pic('btn-chat', 'Ask my portfolio', height=58)) + '</p>')
L.append('')
L.append('<p align="center"><a href="https://www.linkedin.com/in/miguelclavel/">LinkedIn</a> &nbsp;·&nbsp; '
         '<a href="https://miguelclavel.com/assets/Miguel-Clavel-Senior-Product-Designer-Resume-2026.pdf">Resume (PDF)</a> &nbsp;·&nbsp; '
         '<a href="https://miguelclavel.github.io/">Live demos</a> &nbsp;·&nbsp; '
         '<a href="mailto:hello@miguelclavel.com">hello@miguelclavel.com</a></p>')
L.append('')
L.append(pic('stats', '40M+ people a year use the products I design. 23 form fields became 19 tap-answered questions. Site audit score from 66 to 88 after the insurance hub rebuild. 40% less time on research synthesis and prototyping.', width='100%'))
L.append('')
L.append(pic('h-work', 'Selected work. Six of my twelve case studies.', width='100%'))
L.append('')
L.append('<p>' + ''.join(link(f'https://miguelclavel.com/work/{slug}' + U, pic(n, alt, width='50%')) for n, slug, alt in work) + '</p>')
L.append('')
L.append('<details>\n<summary><b>Six more case studies</b></summary>\n')
for slug, title, line in more:
    L.append(f'- [{title}](https://miguelclavel.com/work/{slug}{U}): {line}.')
L.append('\n</details>')
L.append('')
L.append(pic('h-built', 'Built with Claude Code. Designed, coded and shipped by me.', width='100%'))
L.append('')
L.append('<p>' + link('https://chat.miguelclavel.com/' + U, pic('built-chat', 'chat.miguelclavel.com. A portfolio you can talk to. Answers I wrote myself, never guessed. It matches 2,389 of 2,391 test questions. Try it.', width='50%'))
         + link('https://miguelclavel.com/' + U, pic('built-site', 'miguelclavel.com. Twelve case studies, one long scroll, rebuilt side by side with Claude. Visit the site.', width='50%')) + '</p>')
L.append('')
L.append('How they were built: [chat-portfolio](https://github.com/miguelclavel/chat-portfolio) and its [build log](https://github.com/miguelclavel/chat-portfolio/blob/main/BUILD-LOG.md) · [what broke at launch on miguelclavel.com](https://github.com/miguelclavel/miguelclavel.com)')
L.append('')
L.append(pic('h-ai', 'Designing with AI. Free kits, skills and prompts.', width='100%'))
L.append('')
L.append('<p>' + ''.join(link(f'https://github.com/miguelclavel/{repo}', pic(n, alt, width='33.3%')) for n, repo, alt in kits) + '</p>')
L.append('')
L.append('[Find any of my 28 skills by job](https://github.com/miguelclavel/claude-skills-for-designers/blob/main/SKILLS.md). They install in Claude Code in two commands; the research set is `ux-research-skills@miguelclavel`.')
L.append('')
L.append('```\n/plugin marketplace add miguelclavel/claude-skills-for-designers\n/plugin install claude-skills-for-designers@miguelclavel\n```')
L.append('')
L.append(pic('h-copy', 'Things you can copy. Prompt included.', width='100%'))
L.append('')
L.append('<p><a href="https://github.com/miguelclavel/interaction-recipes"><img src="' + A + 'demo-pixel-trail.webp" width="50%" alt="A pixel trail following the pointer around a name"></a>'
         '<a href="https://miguelclavel.github.io/pixel-run-game/"><img src="' + A + 'demo-pixel-run.webp" width="50%" alt="Pixel Run, a small runner game where the blocks spell a name"></a></p>')
L.append('')
L.append('**[Interaction recipes](https://github.com/miguelclavel/interaction-recipes)**: twenty small interactions and fixes from my two portfolios, each with a recording, what went wrong, and the prompt to build your own. **[Pixel Run](https://miguelclavel.github.io/pixel-run-game/)**: the game in my footer, where the blocks you jump spell my name.')
L.append('')
L.append('<sub>One repo and live page each: ' + ' · '.join(f'[{d}](https://github.com/miguelclavel/{d})' for d in demos) + '</sub>')
L.append('')
L.append(pic('how', 'How I work. Before I open Figma, I ask three questions. 1, What behavior are we trying to change? 2, What evidence tells us this is the real problem? 3, What happens if we do nothing? On AI: I use it every day for research synthesis, exploring directions and building working prototypes. It cut my synthesis time by about 40%. I am a product designer who understands AI, not an AI person who makes websites.', width='100%'))
L.append('')
L.append(pic('h-exp', 'Experience. Ten years in design.', width='100%'))
L.append('')
L.append(pic('exp', 'Experience. 2022 to now, U.S. News &amp; World Report, Senior Product Designer, FinTech: credit cards, insurance and loans, and before that Enterprise Systems and 360 Reviews. 2021 to 2022, Miami HEAT, Digital Experience Designer. 2019 to 2021, Empire Medical Training, Senior Graphic Designer, Digital Experience and Brand Strategy. 2014 to 2019, BLU Products, Graphic Designer, Product, Retail and Digital Experience. Education: Florida Atlantic University, BFA in Graphic Design.', width='100%'))
L.append('')
L.append(pic('tools', 'Practice: product strategy, information architecture, journey mapping, user research, usability testing, A/B testing, design systems, accessibility (WCAG), conversational and agentic UX, AI product design. Tools: Figma, FigJam, Figma Make, Claude, Claude Code, v0, analytics and heatmaps.', width='100%'))
L.append('')
L.append('---')
L.append('')
L.append('<sub>More in the <a href="https://github.com/miguelclavel/miguelclavel/wiki">wiki</a>: every case study, how I work with AI, and the interaction prompts. Work is shown for portfolio purposes and was produced during my employment with the companies named. Confidential material has been omitted or altered.</sub>')
open(__import__('os').path.join(__import__('os').path.dirname(__file__), '..', 'README.md'), 'w').write('\n'.join(L) + '\n')
print('ok', len(L))
