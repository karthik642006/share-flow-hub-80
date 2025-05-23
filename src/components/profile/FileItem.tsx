
import React, { useState, useEffect } from "react";
import { File, FileDown, Trash, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface FileData {
  id: string;
  filename: string;
  created_at: string;
  downloads: number;
  file_path: string;
  expires_at: string | null;
}

interface FileItemProps {
  file: FileData;
  isCurrentUser: boolean;
  onDeleteFile: (file: FileData) => void;
}

export const FileItem = ({ file, isCurrentUser, onDeleteFile }: FileItemProps) => {
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    // Calculate and update time left for auto-deletion
    const updateTimeLeft = () => {
      if (!file.expires_at) return;
      
      const expiryDate = new Date(file.expires_at);
      const now = new Date();
      const diff = expiryDate.getTime() - now.getTime();
      
      if (diff <= 0) {
        setTimeLeft("Expired");
        return;
      }
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      setTimeLeft(`${hours}h ${minutes}m`);
    };
    
    updateTimeLeft();
    const timer = setInterval(updateTimeLeft, 60000); // Update every minute
    
    return () => clearInterval(timer);
  }, [file.expires_at]);

  function getFileIcon(filename: string) {
    const extension = filename.split('.').pop()?.toLowerCase();

    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
      return <File className="text-blue-500" size={20} />;
    } else if (['pdf'].includes(extension || '')) {
      return <File className="text-red-500" size={20} />;
    } else if (['doc', 'docx'].includes(extension || '')) {
      return <File className="text-[#2b579a]" size={20} />;
    } else if (['xls', 'xlsx'].includes(extension || '')) {
      return <File className="text-green-600" size={20} />;
    } else {
      return <File className="text-[#7E69AB]" size={20} />;
    }
  }

  const { data } = supabase.storage
    .from('shared-files')
    .getPublicUrl(file.file_path);

  return (
    <div className="flex items-center gap-3 bg-[#f8f6ff] rounded-md px-4 py-2 border relative">
      {getFileIcon(file.filename)}
      <div className="flex-1">
        <span className="font-semibold">{file.filename}</span>
        <div className="text-xs text-gray-500">
          {file.downloads} downloads • {new Date(file.created_at).toLocaleDateString()}
        </div>
        <div className="flex items-center gap-1 mt-1 text-sm text-orange-500">
          <Clock size={14} />
          <span>
            Auto-deletes in {timeLeft}
          </span>
        </div>
      </div>
      <div className="flex items-center">
        <a
          href={data.publicUrl}
          download
          className="text-[#9b87f5] hover:underline p-2"
          target="_blank"
          rel="noopener noreferrer"
          title="Download file (will auto-delete after 24h)"
        >
          <FileDown size={18} />
        </a>
        {isCurrentUser && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onDeleteFile(file)} 
            className="text-red-500" 
            aria-label="Delete file"
          >
            <Trash size={18}/>
          </Button>
        )}
      </div>
    </div>
  );
};
