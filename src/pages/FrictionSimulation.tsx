import React from "react";

function FrictionSimulation() {
  const [showValuesModal, setShowValuesModal] = React.useState(false);
  const [showFormulsModal, setShowFormulsModal] = React.useState(false);
  const [showControlsModal, setShowControlsModals] = React.useState(true);

  const [surfaceType, setSurfaceType] = React.useState<string>('дерево');
  const [mass, setMass] = React.useState<number>(1);
  const [angle, setAngle] = React.useState<number>(0);
  const [isRunning, setIsRunning] = React.useState(false);

  const [frictionCoefficient, setFrictionCoefficient] = React.useState<number>(0.3);
  const [position, setPosition] = React.useState<number>(0);
  const [velocity, setVelocity] = React.useState<number>(0);
  const [acceleration, setAcceleration] = React.useState<number>(0);
  const [gravityForce, setGravityForce] = React.useState<number>(0);
  const [frictionForce, setFrictionForce] = React.useState<number>(0);
  const [normalForce, setNormalForce] = React.useState<number>(0);
  const [netForce, setNetForce] = React.useState<number>(0);

  const GRAVITY = 9.8;
  const canvasWidth = 1000;
  const canvasHeight = 600;
  const surfaceLength = 700;

  const surfaceCoefficients = {
    'лёд': 0.05,
    'дерево': 0.3,
    'металл': 0.6,
    'резина': 0.8,
    'бетон': 0.7
  }

  const animationRef = React.useRef<null | number>(null);
  const lastTimeRef = React.useRef(0);
  const canvasRef = React.useRef<any>(null);

  React.useEffect(() => {
    setFrictionCoefficient(surfaceCoefficients[surfaceType]);
  }, [surfaceType]);

  React.useEffect(() => {
    const angleRad = (angle * Math.PI) / 180;
    const gravityComponent = mass * GRAVITY * Math.sin(angleRad);
    setGravityForce(mass * GRAVITY);

    const normalForceValue = mass * GRAVITY * Math.cos(angleRad);
    setNormalForce(normalForceValue);

    const frictionForceValue = frictionCoefficient * normalForceValue;
    setFrictionForce(frictionForceValue);

    const netForceValue = gravityComponent - frictionForceValue;
    setNetForce(netForceValue > 0 ? netForceValue : 0);

    const accelerationValue = netForceValue > 0 ? netForceValue / mass : 0;
    setAcceleration(accelerationValue);

  }, [mass, angle, frictionCoefficient]);

  const animate = (timestamp: number) => {
    if (!isRunning) return;

    const deltaTime = Math.min((timestamp - lastTimeRef.current) / 1000, 0.1);
    lastTimeRef.current = timestamp;

    const newVelocity = velocity + acceleration * deltaTime;
    setVelocity(newVelocity);

    const newPosition = position + newVelocity * deltaTime * 50;
    setPosition(Math.min(Math.max(newPosition, 0), surfaceLength));

    drawScene();

    if (newPosition >= surfaceLength - 42) {
      setIsRunning(false);
      return;
    }

    animationRef.current = requestAnimationFrame(animate);
  };

  React.useEffect(() => {
    if (isRunning) {
      lastTimeRef.current = performance.now();
      animationRef.current = requestAnimationFrame(animate);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }
  }, [isRunning, position, velocity, acceleration])

  const drawScene = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#f0f9ff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const angleRad = (angle * Math.PI) / 180;
    const surfaceStartX = canvas.width / 6;
    const surfaceStartY = 200;
    const surfaceEndX = surfaceStartX + surfaceLength * Math.cos(angleRad);
    const surfaceEndY = surfaceStartY + surfaceLength * Math.sin(angleRad);

    ctx.beginPath();
    ctx.moveTo(surfaceStartX, surfaceStartY);
    ctx.lineTo(surfaceEndX, surfaceEndY);
    ctx.lineWidth = 20;

    switch (surfaceType) {
      case 'лёд':
        ctx.strokeStyle = '#cdf5fd';
        break;
      case 'дерево':
        ctx.strokeStyle = '#a47551';
        break;
      case 'металл':
        ctx.strokeStyle = '#b4b4b8';
        break;
      case 'резина':
        ctx.strokeStyle = '#3a3a3a';
        break;
      case 'бетон':
        ctx.strokeStyle = '#8b8b8b';
        break;
      default:
        ctx.strokeStyle = '#a47551';
    }

    ctx.stroke();

    if (surfaceType === 'дерево') {
      for (let i = 20; i < surfaceLength; i += 20) {
        const x = surfaceStartX + i * Math.cos(angleRad);
        const y = surfaceStartY + i * Math.sin(angleRad);

        ctx.beginPath();
        ctx.moveTo(x, y - 10);
        ctx.lineTo(x, y + 10);
        ctx.strokeStyle = '#7d5738';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    } else if (surfaceType === 'металл') {
      for (let i = 20; i < surfaceLength; i += 20) {
        const x = surfaceStartX + i * Math.cos(angleRad);
        const y = surfaceStartY + i * Math.sin(angleRad);

        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#d8d8d8';
        ctx.fill();
      }
    }

    const objectX = surfaceStartX + position * Math.cos(angleRad);
    const objectY = surfaceStartY + position * Math.sin(angleRad);

    ctx.save();
    ctx.translate(objectX, objectY);

    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 5;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    ctx.rotate(angleRad);
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(0, -50, 40, 40);

    ctx.fillStyle = '#ffffff';
    ctx.font = '12px Montserrat';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${mass}кг`, 20, -30);

    ctx.restore();

    if (isRunning) {
      const centerX = objectX + 20;
      const centerY = objectY - 30;

      const gravityScale = 2;
      drawArrow({
        ctx: ctx,
        fromX: centerX,
        fromY: centerY,
        toX: centerX,
        toY: centerY + gravityForce * gravityScale,
        color: '#2c3e50',
        label: 'G'
      });

      const normalScale = 2;
      drawArrow({
        ctx: ctx,
        fromX: centerX,
        fromY: centerY,
        toX: centerX + Math.sin(angleRad) * normalForce * normalScale,
        toY: centerY - Math.cos(angleRad) * normalForce * normalScale,
        color: '#3498db',
        label: 'N'
        }
      );

      if (velocity !== 0 || acceleration !== 0) {
        const frictionScale = 2;
        drawArrow({
          ctx: ctx,
          fromX: centerX,
          fromY: centerY,
          toX: centerX - Math.cos(angleRad) * frictionForce * frictionScale * 2,
          toY: centerY - Math.sin(angleRad) * frictionForce * frictionScale * 2,
          color: '#e67e22',
          label: 'Fтр'
          }
        );
      }
    }
  };

  const drawArrow = ({ctx, fromX, fromY, toX, toY, color, label}: {
    ctx: any,
    fromX: any,
    fromY: any,
    toX: any,
    toY: any,
    color: any,
    label: any
  }) => {
    const headLength = 10;
    const angle = Math.atan2(toY - fromY, toX - fromX);

    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);

    ctx.lineTo(toX - headLength * Math.cos(angle - Math.PI / 6),
      toY - headLength * Math.sin(angle - Math.PI / 6)
    );
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headLength * Math.cos(angle + Math.PI / 6),
      toY - headLength * Math.sin(angle + Math.PI / 6)
    );

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = color;
    ctx.font = '14px Arial';
    ctx.fillText(label, toX + 10, toY);
  };

  React.useEffect(() => {
    drawScene();
  }, [surfaceType, angle, position, mass]);

  const resetSimulation = () => {
    setIsRunning(false);
    setPosition(0);
    setVelocity(0);
  };

  return (
    <div className='h-screen w-full bg-gray-100 flex flex-col items-center overflow-hidden'>
      <div className='relative w-full h-full flex justify-center items-center bg-gray-100'>
        <canvas
          ref={canvasRef}
          width={canvasWidth}
          height={canvasHeight}
          className='border border-gray-300 border-lg shadow-lg bg-white'
        />

        <div className='absolute top-4 right-4 flex gap-2'>
          <button
            onClick={() => setShowValuesModal(!showValuesModal)}
            className='bg-blue-500 text-white px-3 py-1 rounded-md shadow hover:bg-blue-600 transition'
          >
            {showValuesModal ? 'Скрыть значения' : 'Показать значения'}
          </button>
          <button
            onClick={() => setShowFormulsModal(!showFormulsModal)}
            className='bg-purple-500 text-white px-3 py-1 rounded-md shadow hover:bg-purple-600 transition'
          >
            {showFormulsModal ? 'Скрыть формулы' : 'Показать формулы'}
          </button>
          <button
            onClick={() => setShowControlsModals(!showControlsModal)}
            className='bg-green-500 text-white px-3 py-1 rounded-md shadow hover:bg-green-600 transition'
          >
            {showControlsModal ? 'Скрыть управление' : 'Показать управление'}
          </button>
        </div>

        {showValuesModal && (
          <div className="absolute top-20 left-4 bg-white p-4 rounded-lg shadow-lg border border-gray-200 w-64">
            <div className="text-lg font-semibold mb-2 text-blue-600">Значения:</div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Масса (m):</span>
                <span>{mass} кг</span>
              </div>
              <div className="flex justify-between">
                <span>Угол (α):</span>
                <span>{angle}°</span>
              </div>
              <div className="flex justify-between">
                <span>Коэфф. трения (μ):</span>
                <span>{frictionCoefficient.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-200 my-1"></div>
              <div className="flex justify-between">
                <span>Сила тяжести (G):</span>
                <span>{gravityForce.toFixed(2)} Н</span>
              </div>
              <div className="flex justify-between">
                <span>Сила реакции опоры(N):</span>
                <span>{normalForce.toFixed(2)} Н</span>
              </div>
              <div className="flex justify-between">
                <span>Сила трения (Fтр):</span>
                <span>{frictionForce.toFixed(2)} Н</span>
              </div>
              <div className="flex justify-between">
                <span>Результ. сила (F):</span>
                <span>{netForce.toFixed(2)} Н</span>
              </div>
              <div className="border-t border-gray-200 my-1"></div>
              <div className="flex justify-between">
                <span>Ускорение (a):</span>
                <span>{acceleration.toFixed(2)} м/с²</span>
              </div>
              <div className="flex justify-between">
                <span>Скорость (v):</span>
                <span>{velocity.toFixed(2)} м/с</span>
              </div>
            </div>
          </div>
        )}

        {showFormulsModal && (
          <div className="absolute top-20 right-4 bg-white p-4 rounded-lg shadow-lg border border-gray-200 w-72">
            <div className="flex justify-between items-center mb-2">
              <div className="text-lg font-semibold text-purple-600">Формулы:</div>
              <button
                onClick={() => setShowFormulsModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <div className="space-y-2 text-sm">
              <div>
                <div className="font-medium">Сила тяжести:</div>
                <div className="pl-2 italic">G = m · g</div>
              </div>
              <div>
                <div className="font-medium">Сила реакции опоры:</div>
                <div className="pl-2 italic">N = m · g · cos(α)</div>
              </div>
              <div>
                <div className="font-medium">Составляющая силы тяжести вдоль наклонной:</div>
                <div className="pl-2 italic">G<sub>х</sub> = m · g · sin(α)</div>
              </div>
              <div>
                <div className="font-medium">Сила трения:</div>
                <div className="pl-2 italic">F<sub>тр</sub> = μ · N</div>
                <div className="pl-2 italic">F<sub>тр</sub> = μ · m · g · cos(α)</div>
              </div>
              <div>
                <div className="font-medium">Результирующая сила:</div>
                <div className="pl-2 italic">F = G<sub>х</sub> - F<sub>тр</sub></div>
                <div className="pl-2 italic">F = m · g · sin(α) - μ · m · g · cos(α)</div>
              </div>
              <div>
                <div className="font-medium">Условие покоя тела:</div>
                <div className="pl-2 italic">F<sub>тр</sub> ≥ G<sub>х</sub></div>
                <div className="pl-2 italic">μ · m · g · cos(α) ≥ m · g · sin(α)</div>
                <div className="pl-2 italic">μ ≥ tg(α)</div>
              </div>
              <div>
                <div className="font-medium">Ускорение:</div>
                <div className="pl-2 italic">a = F / m</div>
                <div className="pl-2 italic">a = g · sin(α) - μ · g · cos(α)</div>
              </div>
              <div>
                <div className="font-medium">Скорость:</div>
                <div className="pl-2 italic">v = v<sub>0</sub> + a · t</div>
              </div>
              <div>
                <div className="font-medium">Перемещение:</div>
                <div className="pl-2 italic">s = v<sub>0</sub> · t + (a · t²) / 2</div>
              </div>
            </div>
          </div>
        )}

        {showControlsModal && (
          <div className="absolute bottom-4 left-4 bg-white p-4 rounded-lg shadow-lg border border-gray-200 w-96">
            <div className="text-lg font-semibold mb-3 text-green-600">Управление симуляцией:</div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Тип поверхности:</label>
                <select
                  value={surfaceType}
                  onChange={(e) => setSurfaceType(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
                  disabled={isRunning}
                >
                  <option value="лёд">Лёд (μ = 0.05)</option>
                  <option value="дерево">Дерево (μ = 0.3)</option>
                  <option value="металл">Металл (μ = 0.6)</option>
                  <option value="резина">Резина (μ = 0.8)</option>
                  <option value="бетон">Бетон (μ = 0.7)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Масса тела (кг): {mass}
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="10"
                  step="0.1"
                  value={mass}
                  onChange={(e) => setMass(parseFloat(e.target.value))}
                  className="mt-1 w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  disabled={isRunning}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Угол наклона (°): {angle}
                </label>
                <input
                  type="range"
                  min="0"
                  max="30"
                  step="1"
                  value={angle}
                  onChange={(e) => setAngle(parseInt(e.target.value))}
                  className="mt-1 w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  disabled={isRunning}
                />
              </div>

              <div className="flex justify-center space-x-4 pt-2">
                <button
                  onClick={() => setIsRunning(!isRunning)}
                  className={`px-4 py-2 rounded-md shadow transition ${
                    isRunning
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-green-500 hover:bg-green-600 text-white'
                  }`}
                >
                  {isRunning ? 'Пауза' : 'Запустить'}
                </button>
                <button
                  onClick={resetSimulation}
                  className="bg-gray-500 text-white px-4 py-2 rounded-md shadow hover:bg-gray-600 transition"
                >
                  Сбросить
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default FrictionSimulation