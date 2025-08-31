"use client";

import { useState, useMemo } from "react";
import { Church } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface ChurchSelectorProps {
  churches: Church[];
  selected: string[];
  onSelectionChange: (selected: string[]) => void;
  isLoading?: boolean;
}

export function ChurchSelector({ churches, selected, onSelectionChange, isLoading = false }: ChurchSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredChurches = useMemo(() => {
    return churches.filter(church =>
      church.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      church.website_url.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [churches, searchTerm]);

  const handleSelectAll = () => {
    if (selected.length === filteredChurches.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(filteredChurches.map(c => c.id));
    }
  };

  const handleSelectChurch = (churchId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selected, churchId]);
    } else {
      onSelectionChange(selected.filter(id => id !== churchId));
    }
  };

  const getDomainFromUrl = (url: string) => {
    try {
      return new URL(url.startsWith('http') ? url : `https://${url}`).hostname;
    } catch {
      return url;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Select Churches</span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              className="text-xs"
            >
              {selected.length === filteredChurches.length ? "Deselect All" : "Select All"}
            </Button>
            {selected.length > 0 && (
              <span className="text-sm text-muted-foreground">
                {selected.length} selected
              </span>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search churches..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="max-h-64 overflow-y-auto space-y-2">
          {isLoading ? (
            <div className="text-center py-4 text-muted-foreground">
              Loading churches...
            </div>
          ) : filteredChurches.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No churches found
            </div>
          ) : (
            filteredChurches.map((church) => (
              <div
                key={church.id}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50"
              >
                <Checkbox
                  id={church.id}
                  checked={selected.includes(church.id)}
                  onCheckedChange={(checked) => 
                    handleSelectChurch(church.id, checked as boolean)
                  }
                />
                <Label
                  htmlFor={church.id}
                  className="flex-1 cursor-pointer"
                >
                  <div className="font-medium">{church.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {getDomainFromUrl(church.website_url)}
                  </div>
                </Label>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
