"use client";

import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Send, Clock, X } from "lucide-react";
import { approveAndSendMessage, editMessageDraft, snoozeMessage, dismissMessage } from "@/app/actions/messages";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface MessageReviewModalProps {
  message: any;
  onClose: () => void;
}

export function MessageReviewModal({ message, onClose }: MessageReviewModalProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(false);
  const [editedSubject, setEditedSubject] = useState(message.subject);
  const [editedBody, setEditedBody] = useState(message.body);
  const [approvalNote, setApprovalNote] = useState("");
  const [channel, setChannel] = useState<"sms" | "email">("sms");

  const sensitiveDetected = message.metadata?.sensitiveTopicDetected;

  const recipientName =
    message.client?.first_name && message.client?.last_name
      ? `${message.client.first_name} ${message.client.last_name}`
      : message.contact?.first_name && message.contact?.last_name
      ? `${message.contact.first_name} ${message.contact.last_name}`
      : "Unknown Client";

  const handleSave = () => {
    startTransition(async () => {
      try {
        await editMessageDraft({
          messageId: message.id,
          trainerId: message.sender_user_id,
          newBody: editedBody,
          newSubject: editedSubject,
        });
        setIsEditing(false);
        toast.success("Message updated");
        router.refresh();
      } catch (error) {
        toast.error("Failed to update message");
      }
    });
  };

  const handleSend = () => {
    startTransition(async () => {
      try {
        await approveAndSendMessage({
          messageId: message.id,
          trainerId: message.sender_user_id,
          editedBody: isEditing ? editedBody : undefined,
          approvalNote,
          channel,
        });
        toast.success("Message sent successfully");
        onClose();
        router.refresh();
      } catch (error: any) {
        toast.error(error.message || "Failed to send message");
      }
    });
  };

  const handleSnooze = (duration: "1h" | "4h" | "24h" | "3d") => {
    startTransition(async () => {
      try {
        await snoozeMessage({
          messageId: message.id,
          trainerId: message.sender_user_id,
          duration,
        });
        toast.success(`Message snoozed for ${duration}`);
        onClose();
        router.refresh();
      } catch (error) {
        toast.error("Failed to snooze message");
      }
    });
  };

  const handleDismiss = () => {
    startTransition(async () => {
      try {
        await dismissMessage({
          messageId: message.id,
          trainerId: message.sender_user_id,
          reason: approvalNote,
        });
        toast.success("Message dismissed");
        onClose();
        router.refresh();
      } catch (error) {
        toast.error("Failed to dismiss message");
      }
    });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Review Message</DialogTitle>
          <DialogDescription>
            AI-drafted message for {recipientName}
          </DialogDescription>
        </DialogHeader>

        {sensitiveDetected && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              This message contains potentially sensitive topics. Please review carefully before
              sending.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div>
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={editedSubject}
              onChange={(e) => {
                setEditedSubject(e.target.value);
                setIsEditing(true);
              }}
              disabled={isPending}
            />
          </div>

          <div>
            <Label htmlFor="body">Message</Label>
            <Textarea
              id="body"
              value={editedBody}
              onChange={(e) => {
                setEditedBody(e.target.value);
                setIsEditing(true);
              }}
              rows={8}
              disabled={isPending}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {editedBody.length} characters
            </p>
          </div>

          <div>
            <Label>Send via</Label>
            <div className="flex gap-2 mt-2">
              <Button
                variant={channel === "sms" ? "default" : "outline"}
                size="sm"
                onClick={() => setChannel("sms")}
                disabled={isPending}
              >
                SMS
              </Button>
              <Button
                variant={channel === "email" ? "default" : "outline"}
                size="sm"
                onClick={() => setChannel("email")}
                disabled={isPending}
              >
                Email
              </Button>
            </div>
          </div>

          {sensitiveDetected && (
            <div>
              <Label htmlFor="note">Approval Note (required for sensitive topics)</Label>
              <Textarea
                id="note"
                value={approvalNote}
                onChange={(e) => setApprovalNote(e.target.value)}
                rows={2}
                placeholder="Why are you sending this message?"
                disabled={isPending}
              />
            </div>
          )}

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="secondary">
              {message.metadata?.messageType?.replace(/_/g, " ")}
            </Badge>
            {message.is_ai_generated && <span>• AI Generated</span>}
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <div className="flex gap-2 flex-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSnooze("1h")}
              disabled={isPending}
            >
              <Clock className="h-4 w-4 mr-1" />
              1h
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSnooze("24h")}
              disabled={isPending}
            >
              <Clock className="h-4 w-4 mr-1" />
              24h
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDismiss}
              disabled={isPending}
            >
              <X className="h-4 w-4 mr-1" />
              Dismiss
            </Button>
          </div>

          <div className="flex gap-2">
            {isEditing && (
              <Button variant="outline" onClick={handleSave} disabled={isPending}>
                Save Changes
              </Button>
            )}
            <Button
              onClick={handleSend}
              disabled={isPending || (sensitiveDetected && !approvalNote)}
            >
              <Send className="h-4 w-4 mr-2" />
              {isPending ? "Sending..." : "Approve & Send"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

