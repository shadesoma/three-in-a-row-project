# ширина холста
width = 1000
# высота холста
height = 800
# количество столбцов
blockCols = 8
# количество строк
blockRows = 10
# размер блока
blockSize = 75
# набор цветов
colors = ["#800", "#080", "#008", "#880", "#088", "#808", "#888"]
# количество цветов
blockTypeCount = colors.length
# массив для хранения уровня
level = []
# текущий счет
score = 0

# создаем холст
canvas = document.createElement "canvas"
canvas.width = width
canvas.height = height
document.body.appendChild canvas

# контекст для рисования
$ = canvas.getContext "2d"

# функция для генерации уровня
generateLevel = () ->
  level = []
  for i in [0 ... blockRows]
    row = []
    for g in [0 ... blockCols]
      flag = true
      while flag
        # генерация случайного блока
        blockType = Math.floor(blockTypeCount * Math.random())
        # если такой блок повторяется три раза
        # по горизонтали
        flag1 = if g >= 2 then (blockType == row[g-1]) and (blockType == row[g-2]) else false
        # или по вертикали
        flag2 = if i >= 2 then (blockType == level[i-1][g]) and (blockType == level[i-2][g]) else false
        # то будем генерировать его заново
        flag = flag1 or flag2
      row.push blockType
    level.push row

# функция для отрисовки уровня    
drawLevel = () -> 
  # очистка экрана
  $.clearRect 0, 0, width, height
  # рисуем уровень
  $.beginPath()
  for i in [0 ... blockRows]
    for g in [0 ... blockCols]
      blockType = level[i][g]
      $.fillStyle = colors[blockType]
      $.fillRect g * (5 + blockSize), i * (5 + blockSize), blockSize, blockSize
  # выводим счет
  $.beginPath()
  $.fillStyle = "#000"
  $.font = "22px Verdana"
  $.textBaseline = "top"
  $.fillText "Score: " + score, (blockSize + 5) * blockCols + 10, 30

# теперь вызываем эти функции
# генерируем уровень
generateLevel()
# и рисуем его
drawLevel()

# первый клик или второй?
firstClick = false

# функция для отрисовки выбранного квадрата
drawSelected = () ->
  return unless firstClick
  # рисуем обводку вокруг него
  $.strokeStyle = "#F00"
  $.lineWidth = 7
  $.beginPath()
  $.rect firstClick[0] * (blockSize + 5), firstClick[1] * (blockSize + 5), blockSize, blockSize
  $.stroke()

# ищем в уроне повторяющиеся блоки
# и возвращаем их в виде массива
checkLevel = () ->
  for i in [0 ... blockRows]
    for g in [0 ... blockCols]
      # по горизонтали
      if g <= blockCols - 3
        count = 1
        arr = [[i, g]]
        while (g + count < blockCols) and (level[i][g] == level[i][g + count])
          arr.push [i, g + count]
          count++
        return arr if count >= 3
      # по вертикали
      if i <= blockRows - 3
        count = 1
        arr = [[i, g]]
        while (i + count < blockRows) and (level[i][g] == level[i + count][g])
          arr.push [i + count, g]
          count++
        return arr if count >= 3
  # если нет блоков по 3 и более, то возвращаем false
  return false

# функция для сдвига уровня вниз после уничтожения блоков
levelDown = () ->
  # был сдвиг
  flag = true
  while flag
    flag = false
    for i in [0 ... blockRows]
      for g in [0 ... blockCols]
        # пустой блок?
        if level[i][g] < 0
          flag = true
          # верхний ряд?
          if i > 0
            # нет - сдвигаем
            level[i][g] = level[i-1][g]
            level[i-1][g] = -1
          else
            # да - генерируем новый
            level[i][g] = Math.floor(blockTypeCount * Math.random())
    drawLevel()
  # отрисовка сдвинутого уровня
  drawLevel()
  # снова запускаем проверку
  drawBoom()   

# функция проверяет уровень на наличие повторяющихся блоков по 3 и более  
drawBoom = () ->
  # отключаем клики
  document.removeEventListener "click", onClick
  # получаем массив повторяющихся блоков
  arr = checkLevel()
  # нет повторяющихся?
  unless arr
    # включаем мышь и играем дальше
    document.addEventListener "click", onClick
    return
  # прибавляем счет
  score += arr.length
  # в качестве анимации будем уменьшать размер блоков
  size = blockSize
  # таймер для анимации
  interval = setInterval () ->
    # уменьшаем размер
    size -= 10
    # рисуем уменьшенные блоки
    arr.forEach (block) ->
      $.clearRect block[1] * (blockSize + 5), block[0] * (blockSize + 5), blockSize, blockSize
      blockType = level[block[0]][block[1]]
      $.fillStyle = colors[blockType]
      # смещение для того, чтобы вывести их отцентрированными
      delta = (blockSize - size) / 2
      $.fillRect delta + block[1] * (5 + blockSize), delta + block[0] * (5 + blockSize), size, size
    # если размер мал, то заканчиваем анимацию
    if size < 0
      clearInterval interval
      # помечаем блоки пустыми
      arr.forEach (block) -> level[block[0]][block[1]] = -1
      # блоки падают вниз и генерируются новые
      levelDown()
  # а это время для срабатывания таймера анимации
  , 50

# функция обрабокт клика мыши  
onClick = (e) ->
  # получаем из координат мыши координаты выбранного блока
  cx = Math.floor(e.pageX / (blockSize + 5))
  cy = Math.floor(e.pageY / (blockSize + 5))
  # клик не по блоку
  return if cx < 0 or cx > blockCols or cy < 0 or cy > blockRows
  # первый клик?
  unless firstClick
    # запоминаем координаты первого клика
    firstClick = [cx, cy]
    # рисуем выделение
    drawSelected()
  else
    # а тут идет обработка второго клика
    # проверка, что клик по соседней клетке
    flag1 = firstClick[0] == cx and Math.abs(firstClick[1] - cy) == 1
    flag2 = firstClick[1] == cy and Math.abs(firstClick[0] - cx) == 1
    flag = flag1 or flag2
    # не соседняя?
    unless flag
      # сброс выделения
      firstClick = false
      drawLevel()
    else
      # меняем местами блоки
      tmp = level[cy][cx]
      level[cy][cx] = level[firstClick[1]][firstClick[0]]
      level[firstClick[1]][firstClick[0]] = tmp
      # проверяем, есть ли совпадения по 3 и более
      check = checkLevel()
      # совпадения есть?
      if check
        firstClick = false
        # отрисовка уровня
        drawLevel()
        # анимация исчезновения блоков
        drawBoom()
      else
        # совпадений нет - меняем обратно местами
        tmp = level[cy][cx]
        level[cy][cx] = level[firstClick[1]][firstClick[0]]
        level[firstClick[1]][firstClick[0]] = tmp
        # сброс и отрисовка уровня
        firstClick = false
        drawLevel()

# вешаем событие клика мыши на документ        
document.addEventListener "click", onClick
