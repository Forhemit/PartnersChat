import { getModelIdentity } from '../utils/modelIdentity';

export default function ModelAvatar({ modelId, size = 24 }) {
    const identity = getModelIdentity(modelId);
    const Icon = identity.icon;

    return (
        <div
            className="model-avatar"
            style={{
                width: size,
                height: size,
                borderRadius: '50%',
                backgroundColor: identity.bgTint,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: identity.color
            }}
            title={modelId}
        >
            <Icon size={size * 0.6} />
        </div>
    );
}
