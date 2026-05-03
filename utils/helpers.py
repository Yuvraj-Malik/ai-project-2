def get_status(rul):
    if rul > 100:
        return "SAFE"
    elif rul > 50:
        return "WARNING"
    else:
        return "CRITICAL"