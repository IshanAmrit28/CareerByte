
import json
import re

text = """
## Role Based Roadmaps
[Frontend Beginner](https://roadmap.sh/frontend?r=frontend-beginner)
[Backend Beginner](https://roadmap.sh/backend?r=backend-beginner)
[DevOps Beginner](https://roadmap.sh/devops?r=devops-beginner)
[Frontend](https://roadmap.sh/frontend)
[Backend](https://roadmap.sh/backend)
[Full Stack](https://roadmap.sh/full-stack)
[API Design](https://roadmap.sh/api-design)
[QA](https://roadmap.sh/qa)
[DevOps](https://roadmap.sh/devops)
[Android](https://roadmap.sh/android)
[iOS](https://roadmap.sh/ios)
[PostgreSQL](https://roadmap.sh/postgresql-dba)
[Software Architect](https://roadmap.sh/software-architect)
[Technical Writer](https://roadmap.sh/technical-writer)
[DevRel Engineer](https://roadmap.sh/devrel)
[Machine Learning](https://roadmap.sh/machine-learning)
[AI and Data Scientist](https://roadmap.sh/ai-data-scientist)
[AI Engineer](https://roadmap.sh/ai-engineer)
[AI Agents](https://roadmap.sh/ai-agents)
[Data Analyst](https://roadmap.sh/data-analyst)
[BI Analyst](https://roadmap.sh/bi-analyst)
[Data Engineer](https://roadmap.sh/data-engineer)
[MLOps](https://roadmap.sh/mlops)
[Product Manager](https://roadmap.sh/product-manager)
[Engineering Manager](https://roadmap.sh/engineering-manager)
[Client Side Game Dev.](https://roadmap.sh/game-developer)
[Server Side Game Dev.](https://roadmap.sh/server-side-game-developer)
[UX Design](https://roadmap.sh/ux-design)
[Blockchain](https://roadmap.sh/blockchain)
[Cyber Security](https://roadmap.sh/cyber-security)

## Skill Based Roadmaps
[WordPress](https://roadmap.sh/wordpress)
[GraphQL](https://roadmap.sh/graphql)
[Git and GitHub](https://roadmap.sh/git-github)
[React](https://roadmap.sh/react)
[Vue](https://roadmap.sh/vue)
[Angular](https://roadmap.sh/angular)
[Next.js](https://roadmap.sh/nextjs)
[Spring Boot](https://roadmap.sh/spring-boot)
[ASP.NET Core](https://roadmap.sh/aspnet-core)
[Laravel](https://roadmap.sh/laravel)
[HTML](https://roadmap.sh/html)
[CSS](https://roadmap.sh/css)
[JavaScript](https://roadmap.sh/javascript)
[Kotlin](https://roadmap.sh/kotlin)
[Swift & Swift-UI](https://roadmap.sh/swift-ui)
[TypeScript](https://roadmap.sh/typescript)
[Node.js](https://roadmap.sh/nodejs)
[PHP](https://roadmap.sh/php)
[C++](https://roadmap.sh/cpp)
[Go](https://roadmap.sh/golang)
[Rust](https://roadmap.sh/rust)
[Python](https://roadmap.sh/python)
[Java](https://roadmap.sh/java)
[SQL](https://roadmap.sh/sql)
[Shell / Bash](https://roadmap.sh/shell-bash)
[Docker](https://roadmap.sh/docker)
[Kubernetes](https://roadmap.sh/kubernetes)
[AWS](https://roadmap.sh/aws)
[Cloudflare](https://roadmap.sh/cloudflare)
[Linux](https://roadmap.sh/linux)
[Terraform](https://roadmap.sh/terraform)
[React Native](https://roadmap.sh/react-native)
[Flutter](https://roadmap.sh/flutter)
[MongoDB](https://roadmap.sh/mongodb)
[Redis](https://roadmap.sh/redis)
[Elasticsearch](https://roadmap.sh/elasticsearch)
[Computer Science](https://roadmap.sh/computer-science)
[Data Structures](https://roadmap.sh/datastructures-and-algorithms)
[System Design](https://roadmap.sh/system-design)
[Design and Architecture](https://roadmap.sh/software-design-architecture)
[Code Review](https://roadmap.sh/code-review)
[AI Red Teaming](https://roadmap.sh/ai-red-teaming)
[Prompt Engineering](https://roadmap.sh/prompt-engineering)
[Design System](https://roadmap.sh/design-system)
"""

# IDs to exclude because we have better versions manually
exclude_ids = ['frontend', 'backend', 'fullstack', 'systemdesign', 'datastructuresandalgorithms', 'dsa', 'systemDesign']

def parse_roadmaps(text):
    roadmaps = {}
    
    # Process each line
    lines = text.strip().split('\n')
    current_category = "Role Based"
    
    for line in lines:
        if "Skill Based Roadmaps" in line:
            current_category = "Skill Based"
            continue
        if "Role Based Roadmaps" in line:
            current_category = "Role Based"
            continue
            
        match = re.search(r'\[(.*?)\]\((.*?)\)', line)
        if match:
            title = match.group(1)
            url = match.group(2)
            
            if '?' in url:
                roadmap_id = url.split('?r=')[1]
            else:
                roadmap_id = url.split('/')[-1]
                
            # Clean up ID
            roadmap_id = roadmap_id.replace('-', '')
            
            if roadmap_id in exclude_ids or roadmap_id == 'fullstack': 
                continue
            
            icon = "🗺️" 
            if "AI" in title: icon = "🤖"
            elif "Data" in title: icon = "📊"
            elif "Game" in title: icon = "🎮"
            elif "Security" in title or "Cyber" in title: icon = "🔒"
            elif "Android" in title or "iOS" in title or "Mobile" in title or "Flutter" in title or "React Native" in title: icon = "📱"
            elif "DevOps" in title: icon = "🚀"
            elif "Design" in title: icon = "🎨"
            
            roadmaps[roadmap_id] = {
                "id": roadmap_id,
                "title": title,
                "description": f"Official {title} Roadmap from roadmap.sh",
                "icon": icon,
                "color": "#667eea",
                "estimatedTime": "Varies",
                "category": current_category,
                "link": url,
                "milestones": [] 
            }
            
    return roadmaps

data = parse_roadmaps(text)

js_content = "export const extraRoadmaps = " + json.dumps(data, indent=4) + ";"

with open('src/data/extraRoadmaps.js', 'w') as f:
    f.write(js_content)
