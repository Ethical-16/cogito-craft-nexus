import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Search, Plus, BookOpen, Tag } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type KnowledgeBaseItem = Database['public']['Tables']['knowledge_base']['Row'];

export const KnowledgeBase = () => {
  const [articles, setArticles] = useState<KnowledgeBaseItem[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<KnowledgeBaseItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newArticle, setNewArticle] = useState({
    title: "",
    content: "",
    category: "",
    tags: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchArticles();
  }, []);

  useEffect(() => {
    filterArticles();
  }, [articles, searchTerm, selectedCategory]);

  const fetchArticles = async () => {
    try {
      const { data, error } = await supabase
        .from('knowledge_base')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error('Error fetching articles:', error);
      toast({
        title: "Error",
        description: "Failed to fetch knowledge base articles",
        variant: "destructive",
      });
    }
  };

  const filterArticles = () => {
    let filtered = articles;

    if (searchTerm) {
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter(article => article.category === selectedCategory);
    }

    setFilteredArticles(filtered);
  };

  const createArticle = async () => {
    try {
      const { error } = await supabase
        .from('knowledge_base')
        .insert({
          title: newArticle.title,
          content: newArticle.content,
          category: newArticle.category,
          tags: newArticle.tags.split(',').map(tag => tag.trim()).filter(Boolean)
        });

      if (error) throw error;

      setNewArticle({ title: "", content: "", category: "", tags: "" });
      setIsDialogOpen(false);
      fetchArticles();
      toast({
        title: "Success",
        description: "Knowledge base article created successfully",
      });
    } catch (error) {
      console.error('Error creating article:', error);
      toast({
        title: "Error",
        description: "Failed to create article",
        variant: "destructive",
      });
    }
  };

  const categories = [...new Set(articles.map(article => article.category))];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Knowledge Base</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Article
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Article</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Article title"
                value={newArticle.title}
                onChange={(e) => setNewArticle({ ...newArticle, title: e.target.value })}
              />
              <Input
                placeholder="Category"
                value={newArticle.category}
                onChange={(e) => setNewArticle({ ...newArticle, category: e.target.value })}
              />
              <Input
                placeholder="Tags (comma separated)"
                value={newArticle.tags}
                onChange={(e) => setNewArticle({ ...newArticle, tags: e.target.value })}
              />
              <Textarea
                placeholder="Article content"
                value={newArticle.content}
                onChange={(e) => setNewArticle({ ...newArticle, content: e.target.value })}
                rows={8}
              />
              <Button 
                onClick={createArticle} 
                disabled={!newArticle.title || !newArticle.content || !newArticle.category}
                className="w-full"
              >
                Create Article
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search articles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={selectedCategory === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory("all")}
          >
            All
          </Button>
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredArticles.map((article) => (
          <Card key={article.id} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3 mb-3">
              <BookOpen className="h-5 w-5 text-primary mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold text-sm mb-1">{article.title}</h3>
                <Badge variant="secondary" className="text-xs">{article.category}</Badge>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
              {article.content}
            </p>
            
            {article.tags && article.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {article.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs flex items-center gap-1">
                    <Tag className="h-2 w-2" />
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>

      {filteredArticles.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No articles found</p>
          {searchTerm && (
            <p className="text-sm">Try adjusting your search terms</p>
          )}
        </div>
      )}
    </div>
  );
};