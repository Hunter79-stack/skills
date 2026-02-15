#!/usr/bin/env python3
"""Heartbeat with I'm Doing System Integration"""
import sys
import json
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from agent_state import AgentState

def heartbeat_with_state(agent_name="qst"):
    state_mgr = AgentState(agent_name)
    state = state_mgr.get_status()
    
    result = {
        "agent": agent_name,
        "status": state.get('status', 'idle'),
        "task": state.get('task'),
        "progress": state.get('progress', 0),
        "can_interrupt": state_mgr.can_interrupt()
    }
    
    if state['status'] == 'doing':
        result.update({
            "message": f"[{agent_name}] DOING: {state['task']} ({state['progress']}%)",
            "skip_low_priority": True,
            "checks": ['mentions', 'alerts'],
            "checks_skipped": ['forum_patrol', 'vote_check']
        })
    elif state['status'] == 'waiting':
        result.update({
            "message": f"[{agent_name}] WAITING",
            "skip_low_priority": True,
            "checks": ['mentions'],
            "checks_skipped": ['forum_patrol', 'vote_check', 'alerts']
        })
    elif state['status'] == 'paused':
        result.update({
            "message": f"[{agent_name}] PAUSED",
            "skip_all": True,
            "checks": [],
            "checks_skipped": ['all']
        })
    else:
        result.update({
            "message": f"[{agent_name}] IDLE: Full heartbeat",
            "skip_low_priority": False,
            "checks": ['mentions', 'alerts', 'forum_patrol', 'vote_check'],
            "checks_skipped": []
        })
    
    return result

if __name__ == "__main__":
    agent = sys.argv[1] if len(sys.argv) > 1 else "qst"
    result = heartbeat_with_state(agent)
    print(json.dumps(result, ensure_ascii=False, indent=2))
