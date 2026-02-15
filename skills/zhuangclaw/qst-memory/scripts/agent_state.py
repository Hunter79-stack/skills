#!/usr/bin/env python3
"""Agent State Manager - "I'm Doing" System v1.0"""

import json
import uuid
from pathlib import Path
from datetime import datetime
from typing import Optional, Dict, Any, List
from enum import Enum

SKILL_DIR = Path(__file__).parent.parent
DATA_DIR = SKILL_DIR / "data"
DATA_DIR.mkdir(exist_ok=True)

class AgentStatus(Enum):
    IDLE = "idle"
    DOING = "doing"
    WAITING = "waiting"
    PAUSED = "paused"
    COMPLETED = "completed"
    FAILED = "failed"

class AgentState:
    def __init__(self, agent_name: str):
        self.agent = agent_name
        self.state_file = DATA_DIR / f"{agent_name}_doing-state.json"
        self.events_file = DATA_DIR / f"{agent_name}_events.json"
        
    def _load_state(self) -> Dict[str, Any]:
        if self.state_file.exists():
            with open(self.state_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        return {
            "id": str(uuid.uuid4()),
            "agent": self.agent,
            "status": AgentStatus.IDLE.value,
            "task": None,
            "type": None,
            "progress": 0,
            "start_time": None,
            "updated_time": datetime.now().isoformat(),
            "eta": None,
            "context": {}
        }
    
    def _save_state(self, state: Dict[str, Any]):
        state["updated_time"] = datetime.now().isoformat()
        with open(self.state_file, 'w', encoding='utf-8') as f:
            json.dump(state, f, ensure_ascii=False, indent=2)
    
    def _log_event(self, event_type: str, description: str, details: Dict = None):
        event = {
            "id": str(uuid.uuid4()),
            "timestamp": datetime.now().isoformat(),
            "event_type": event_type,
            "description": description,
            "details": details or {}
        }
        events = []
        if self.events_file.exists():
            with open(self.events_file, 'r', encoding='utf-8') as f:
                events = json.load(f)
        events.append(event)
        events = events[-1000:]
        with open(self.events_file, 'w', encoding='utf-8') as f:
            json.dump(events, f, ensure_ascii=False, indent=2)
    
    def start(self, task: str, task_type: str = "Development", 
              context: Dict = None, eta: str = None) -> Dict[str, Any]:
        state = self._load_state()
        if state["status"] == AgentStatus.DOING.value and state["task"]:
            self._log_event("TASK_INTERRUPTED", f"中断: {state['task']}", 
                          {"old_task": state["task"], "new_task": task})
        state.update({
            "id": str(uuid.uuid4()),
            "status": AgentStatus.DOING.value,
            "task": task,
            "type": task_type,
            "progress": 0,
            "start_time": datetime.now().isoformat(),
            "eta": eta,
            "context": context or {}
        })
        self._save_state(state)
        self._log_event("TASK_START", f"开始: {task}", state)
        return state
    
    def update(self, progress: int = None, context: Dict = None) -> Dict[str, Any]:
        state = self._load_state()
        if state["status"] != AgentStatus.DOING.value:
            raise ValueError(f"无法更新：当前 {state['status']}")
        if progress is not None:
            state["progress"] = min(100, max(0, progress))
        if context:
            state["context"].update(context)
        self._save_state(state)
        self._log_event("PROGRESS_UPDATE", f"进度: {state['task']} ({state['progress']}%)", state)
        return state
    
    def pause(self, reason: str = None) -> Dict[str, Any]:
        state = self._load_state()
        if state["status"] != AgentStatus.DOING.value:
            raise ValueError(f"无法暂停：当前 {state['status']}")
        state["status"] = AgentStatus.PAUSED.value
        state["context"]["pause_reason"] = reason
        self._save_state(state)
        self._log_event("TASK_PAUSED", f"暂停: {reason}", state)
        return state
    
    def resume(self) -> Dict[str, Any]:
        state = self._load_state()
        if state["status"] != AgentStatus.PAUSED.value:
            raise ValueError(f"无法恢复：当前 {state['status']}")
        state["status"] = AgentStatus.DOING.value
        state["context"].pop("pause_reason", None)
        self._save_state(state)
        self._log_event("TASK_RESUMED", f"恢复: {state['task']}", state)
        return state
    
    def wait(self, condition: str) -> Dict[str, Any]:
        state = self._load_state()
        state["status"] = AgentStatus.WAITING.value
        state["context"]["waiting_for"] = condition
        self._save_state(state)
        self._log_event("TASK_WAITING", f"等待: {condition}", state)
        return state
    
    def complete(self, result: str = None) -> Dict[str, Any]:
        state = self._load_state()
        state["status"] = AgentStatus.COMPLETED.value
        state["progress"] = 100
        state["context"]["result"] = result
        state["completed_time"] = datetime.now().isoformat()
        self._save_state(state)
        self._log_event("TASK_COMPLETED", f"完成: {result}", state)
        return state
    
    def fail(self, reason: str = None) -> Dict[str, Any]:
        state = self._load_state()
        state["status"] = AgentStatus.FAILED.value
        state["context"]["failure_reason"] = reason
        state["failed_time"] = datetime.now().isoformat()
        self._save_state(state)
        self._log_event("TASK_FAILED", f"失败: {reason}", state)
        return state
    
    def get_status(self) -> Dict[str, Any]:
        return self._load_state()
    
    def get_events(self, limit: int = 50) -> List[Dict[str, Any]]:
        if not self.events_file.exists():
            return []
        with open(self.events_file, 'r', encoding='utf-8') as f:
            events = json.load(f)
        return events[-limit:]
    
    def is_doing(self) -> bool:
        return self._load_state()["status"] == AgentStatus.DOING.value
