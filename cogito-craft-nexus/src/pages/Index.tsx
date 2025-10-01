import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, MessageSquare, BarChart3, BookOpen, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Bot className="h-12 w-12 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">AI Support Hub</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            GenAI-powered customer support dashboard built with React, Python, and MongoDB. 
            Streamline your support operations with intelligent automation.
          </p>
          <Link to="/dashboard">
            <Button size="lg" className="gap-2">
              Launch Dashboard
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-blue-500" />
                Smart Ticket Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                AI-powered ticket routing, auto-categorization, and intelligent response suggestions 
                to resolve customer issues faster.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-purple-500" />
                GenAI Integration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Leverage advanced language models for automated responses, sentiment analysis, 
                and intelligent customer insights.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-green-500" />
                Knowledge Base
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Searchable knowledge base with AI-powered content suggestions and 
                automatic article recommendations for agents.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-orange-500" />
                Real-time Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Comprehensive dashboards with performance metrics, resolution times, 
                and customer satisfaction tracking.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-red-500" />
                Live Chat
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Real-time messaging with customers, AI-suggested responses, 
                and seamless escalation workflows.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-indigo-500" />
                Automation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Automated ticket assignment, priority classification, 
                and follow-up scheduling powered by machine learning.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tech Stack */}
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-6">Built with Modern Tech Stack</h2>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="bg-white rounded-lg px-4 py-2 shadow-sm">React.js</div>
            <div className="bg-white rounded-lg px-4 py-2 shadow-sm">TypeScript</div>
            <div className="bg-white rounded-lg px-4 py-2 shadow-sm">Python APIs</div>
            <div className="bg-white rounded-lg px-4 py-2 shadow-sm">MongoDB</div>
            <div className="bg-white rounded-lg px-4 py-2 shadow-sm">GenAI Models</div>
            <div className="bg-white rounded-lg px-4 py-2 shadow-sm">Tailwind CSS</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
