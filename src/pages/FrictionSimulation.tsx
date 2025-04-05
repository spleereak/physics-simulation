import React from "react";
import {Modal} from "../components/Modal.tsx";
import {ValueRow} from "../components/ValueRow.tsx";
import {Formula} from "../components/Formula.tsx";

function FrictionSimulation() {
  const [showValuesModal, setShowValuesModal] = React.useState(false);
  const [showFormulasModal, setShowFormulasModal] = React.useState(false);
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
  }, [isRunning, position, velocity, acceleration]);

  const drawRoundedRect = (ctx: any, x: number, y: number, width: number, height: number, radius: number) => {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
  };

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
    drawRoundedRect(ctx, 0, -50, 40, 40, 8);

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
    <div className='min-h-screen w-full bg-gray-100 flex flex-col items-center overflow-hidden'>
      <div className='relative w-full min-h-screen flex justify-center items-center bg-gray-100 py-8'>
        <canvas
          ref={canvasRef}
          width={canvasWidth}
          height={canvasHeight}
          className='border border-gray-300 border-lg shadow-lg bg-white'
        />

        <div className='absolute top-4 right-4 flex gap-2'>
          <button
            onClick={() => setShowValuesModal(!showValuesModal)}
            className='bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 flex items-center space-x-1'
          >
            {showValuesModal ? 'Скрыть значения' : 'Показать значения'}
          </button>
          <button
            onClick={() => setShowFormulasModal(!showFormulasModal)}
            className='bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg hover:from-purple-600 hover:purple transition-all duration-300 flex items-center space-x-1'
          >
            {showFormulasModal ? 'Скрыть формулы' : 'Показать формулы'}
          </button>
          <button
            onClick={() => setShowControlsModals(!showControlsModal)}
            className='bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg hover:from-green-600 hover:to-grenn-700 transition-all duration-300 flex items-center space-x-1'
          >
            {showControlsModal ? 'Скрыть управление' : 'Показать управление'}
          </button>
        </div>

        <div className='absolute top-20 left-4 transition-all duration-300 transform'>
          <Modal
            title='Измеряемые значения'
            color='bg-gradient-to-r from-blue-500 to-blue-600'
            isVisible={showValuesModal}
            onClose={() => setShowValuesModal(false)}
          >
            <div className='w-64 space-y-0.5'>
              <div className='mb-2 font-medium text-blue-600 border-b pb-1'>Параметры:</div>
              <ValueRow label='Масса (m)' value={mass} unit='кг' />
              <ValueRow label='Угол (α)' value={angle} unit='°' />
              <ValueRow label='Коэфф. трения (µ)' value={frictionCoefficient.toFixed(2)} />

              <div className='my-2 font-medium text-blue-600 border-b pb-1 pt-2'>Силы:</div>
              <ValueRow label='Сила тяжести (G)' value={gravityForce.toFixed(2)} unit=' H' />
              <ValueRow label='Сила реакции опоры (N)' value={normalForce.toFixed(2)} unit=' H' />
              <ValueRow label='Сила трения (Fр)' value={frictionForce.toFixed(2)} unit=' H' />
              <ValueRow label='Результирующая сила (F)' value={netForce.toFixed(2)} unit=' H' />

              <div className='my-2 font-medium text-blue-600 border-b pb-1 pt-2'>Кинематика:</div>
              <ValueRow label='Ускорение (a)' value={acceleration.toFixed(2)} unit=' м/с²' />
              <ValueRow label='Скорость (v)' value={velocity.toFixed(2)} unit=' м/с' />
            </div>
          </Modal>
        </div>

        <div className='absolute top-20 right-4 transition-all duration-300 transform'>
          <Modal
            title='Основные формулы'
            color='bg-gradient-to-r from-purple-500 to-purple-600'
            isVisible={showFormulasModal}
            onClose={() => setShowFormulasModal(false)}
          >
            <div className='w-72 space-y-1'>
              <Formula
                title='Сила тяжести'
                formulas={["G = m * g"]}
              />
              <Formula
                title="Сила реакции опоры"
                formulas={["N = m · g · cos(α)"]}
              />
              <Formula
                title="Составляющая силы тяжести вдоль наклонной"
                formulas={["Gх = m · g · sin(α)"]}
              />
              <Formula
                title="Сила трения"
                formulas={[
                  "Fтр = μ · N",
                  "Fтр = μ · m · g · cos(α)"
                ]}
              />
              <Formula
                title="Результирующая сила"
                formulas={[
                  "F = Gх - Fтр",
                  "F = m · g · sin(α) - μ · m · g · cos(α)"
                ]}
              />
              <Formula
                title="Условие покоя тела"
                formulas={[
                  "Fтр ≥ Gх",
                  "μ · m · g · cos(α) ≥ m · g · sin(α)",
                  "μ ≥ tg(α)"
                ]}
              />
              <Formula
                title='Ускорение'
                formulas={[
                  "a = F / m",
                  "a = g · sin(α) - μ · g · cos(α)"
                ]}
              />
              <Formula
                title='Скорость'
                formulas={["v = v₀ + a · t"]}
              />
              <Formula
                title='Перемещение'
                formulas={["S = v₀ · t + (a · t²) / 2"]}
              />
            </div>
          </Modal>
        </div>

        <div className='absolute bottom-4 right-4 transition-all duration-300'>
          <Modal
            title='Управление симуляцией'
            color='bg-gradient-to-r from-green-500 to-green-600'
            isVisible={showControlsModal}
            onClose={() => setShowControlsModals(false)}
          >
            <div className='w-80 space-y-3'>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Тип поверхности:</label>
                <select
                  value={surfaceType}
                  onChange={(e) => setSurfaceType(e.target.value)}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 transition-all"
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
                <div className="flex justify-between">
                  <label className="block text-sm font-medium text-gray-700">
                    Масса тела:
                  </label>
                  <span className="font-medium text-green-600">{mass} кг</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="10"
                  step="0.1"
                  value={mass}
                  onChange={(e) => setMass(parseFloat(e.target.value))}
                  className="mt-1 w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-green-500"
                  disabled={isRunning}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0.1 кг</span>
                  <span>10 кг</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between">
                  <label className="block text-sm font-medium text-gray-700">
                    Угол наклона:
                  </label>
                  <span className="font-medium text-green-600">{angle}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  step="1"
                  value={angle}
                  onChange={(e) => setAngle(parseInt(e.target.value))}
                  className="mt-1 w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-green-500"
                  disabled={isRunning}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0°</span>
                  <span>30°</span>
                </div>
              </div>

              <div className='flex justify-center space-x-2 pt-1'>
                <button
                  onClick={() => setIsRunning(!isRunning)}
                  className={`px-4 py-2 text-sm rounded-lg shadow-md hover:cursor-pointer transition-all duration-300 font-medium ${
                    isRunning
                      ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white'
                      : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white'
                  }`}
                >
                  {isRunning ? 'Пауза' : 'Запустить'}
                </button>
                <button
                  onClick={resetSimulation}
                  className='bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 hover:cursor-pointer text-white px-4 py-2 rounded-lg shadow-md transition-all duration-300 font-medium'
                >
                  Сбросить
                </button>
              </div>
            </div>
          </Modal>
        </div>
      </div>
    </div>
  )
}

export default FrictionSimulation